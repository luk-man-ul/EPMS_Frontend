import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Card, Badge, LoadingSpinner, ErrorMessage } from '../ui';
import api, { getAccessToken } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './NotificationBell.css';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

const SOCKET_URL = import.meta.env.VITE_API_URL as string;

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  // initialLoading is only true on the very first fetch — prevents flicker on polls
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  // Track whether we have ever loaded data for this user
  const hasFetchedRef = useRef(false);

  // ─── Fetch from REST ─────────────────────────────────────────────────────
  // isInitial=true → show spinner (first load only)
  // isInitial=false → silent background refresh, no loading state change
  const fetchNotifications = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setInitialLoading(true);
      setError(null);
      const response = await api.get('/notifications');
      // Batch both state updates together to produce a single re-render
      setNotifications(response.data.notifications ?? []);
      setUnreadCount(response.data.unreadCount ?? 0);
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message ?? 'Failed to load notifications';
      console.error('Failed to fetch notifications:', err);
      setError(msg);
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  }, []); // stable — no deps that change

  // ─── Reset + reconnect whenever the logged-in user changes ───────────────
  useEffect(() => {
    // Clear previous user's data immediately
    setNotifications([]);
    setUnreadCount(0);
    setIsOpen(false);
    setError(null);
    hasFetchedRef.current = false;

    // Disconnect any existing socket
    socketRef.current?.disconnect();
    socketRef.current = null;

    if (!user?.id) return;

    // Initial REST fetch — show spinner
    hasFetchedRef.current = true;
    fetchNotifications(true);

    // Fallback polling every 60 s — silent, no spinner
    const interval = setInterval(() => fetchNotifications(false), 60_000);

    // ── WebSocket connection to /notifications namespace ──────────────────
    const token = getAccessToken();
    if (token) {
      const socket = io(`${SOCKET_URL}/notifications`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      socket.on('connect', () => {
        console.log('[Notifications] Socket connected:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('[Notifications] Socket disconnected');
      });

      socket.on('error', (err: unknown) => {
        console.error('[Notifications] Socket error:', err);
      });

      // Real-time push: prepend notification and bump count.
      // Uses functional updates so both state changes are batched by React
      // into a single re-render (React 18 automatic batching).
      socket.on('notification', (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      socketRef.current = socket;
    }

    return () => {
      clearInterval(interval);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]); // fetchNotifications intentionally omitted — it is stable (useCallback([])) and including it would re-run this effect on every render in React strict mode

  // ─── Close dropdown on outside click ─────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // ─── Actions ─────────────────────────────────────────────────────────────
  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // ─── Resolve navigation path from notification type + metadata ───────────
  const getNotificationPath = (n: Notification): string | null => {
    const meta = n.metadata ?? {};
    const isAdmin = user?.role === 'ADMIN';
    const base = isAdmin ? '/admin' : '/app';

    switch (n.type) {
      // Task notifications
      case 'TASK_ASSIGNED':
      case 'TASK_APPROVED':
      case 'TASK_REJECTED': {
        const taskId = (meta.taskId ?? n.entityId) as string | undefined;
        if (taskId) return `${base}/tasks/${taskId}`;
        return `${base}/tasks`;
      }
      // Self-work approval
      case 'SELF_WORK_REQUESTED':
        return `${base}/tasks/approval`;
      // Leave notifications
      case 'LEAVE_REQUESTED':
        return isAdmin ? '/admin/leave/approvals' : '/app/leave/approvals';
      case 'LEAVE_APPROVED':
      case 'LEAVE_REJECTED':
        return isAdmin ? '/admin/leave/approvals' : '/app/leave';
      // WFH notifications
      case 'WFH_REQUESTED':
        return isAdmin ? '/admin/wfh/requests' : '/app/wfh/requests';
      case 'WFH_APPROVED':
      case 'WFH_REJECTED':
        return isAdmin ? '/admin/wfh/requests' : '/app/wfh';
      // Project notifications
      case 'PROJECT_ASSIGNED': {
        const projectId = (meta.projectId ?? n.entityId) as string | undefined;
        if (projectId) return `${base}/projects/${projectId}`;
        return `${base}/projects`;
      }
      // Ticket notifications
      case 'TICKET_RAISED':
      case 'TICKET_ASSIGNED': {
        const ticketId = (meta.ticketId ?? n.entityId) as string | undefined;
        if (ticketId) return `${base}/tickets/${ticketId}`;
        return `${base}/tickets`;
      }
      default:
        return null;
    }
  };

  // ─── Handle notification click: mark read + navigate ─────────────────────
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    // Navigate to relevant page
    const path = getNotificationPath(notification);
    if (path) {
      setIsOpen(false);
      navigate(path);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      TASK_ASSIGNED:        '📋',
      TASK_APPROVED:        '✅',
      TASK_REJECTED:        '❌',
      SELF_WORK_REQUESTED:  '📝',
      LEAVE_REQUESTED:      '📅',
      LEAVE_APPROVED:       '✅',
      LEAVE_REJECTED:       '❌',
      WFH_REQUESTED:        '🏠',
      WFH_APPROVED:         '✅',
      WFH_REJECTED:         '❌',
      PROJECT_ASSIGNED:     '📁',
      TICKET_RAISED:        '🎫',
      TICKET_ASSIGNED:      '🎫',
    };
    return icons[type] ?? '🔔';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1)  return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7)  return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <Badge variant="danger" className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown" role="dialog" aria-label="Notifications panel">
          <Card padding="none" className="notification-card">
            <div className="notification-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button className="mark-all-read-btn" onClick={markAllAsRead}>
                  Mark all as read
                </button>
              )}
            </div>

            <div className="notification-list">
              {initialLoading ? (
                <div className="notification-loading">
                  <LoadingSpinner size="sm" text="Loading..." />
                </div>
              ) : error ? (
                <div className="notification-error">
                  <ErrorMessage type="field" message={error} />
                </div>
              ) : notifications.length === 0 ? (
                <div className="notification-empty">
                  <span className="empty-icon">📭</span>
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 20).map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: getNotificationPath(notification) ? 'pointer' : 'default' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNotificationClick(notification);
                    }}
                  >
                    <div className="notification-icon" aria-hidden="true">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">{formatTime(notification.createdAt)}</div>
                    </div>
                    {!notification.isRead && (
                      <div className="notification-unread-dot" aria-label="Unread" />
                    )}
                  </div>
                ))
              )}
            </div>

            {notifications.length > 20 && (
              <div className="notification-footer">
                <button
                  className="view-all-btn"
                  onClick={() => {
                    setIsOpen(false);
                    fetchNotifications(false);
                  }}
                >
                  Refresh to see all
                </button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
