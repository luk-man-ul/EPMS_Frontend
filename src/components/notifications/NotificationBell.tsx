import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card, Badge, LoadingSpinner, ErrorMessage } from '../ui';
import api from '../../utils/api';
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

/** Read the JWT token from whichever storage it was saved to. */
function getToken(): string | null {
  try {
    const ls = localStorage.getItem('token');
    if (ls && ls !== 'undefined' && ls !== 'null') return ls;
    const ss = sessionStorage.getItem('token');
    if (ss && ss !== 'undefined' && ss !== 'null') return ss;
  } catch { /* ignore */ }
  return null;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // ─── Fetch from REST (initial load + fallback polling) ───────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications ?? []);
      setUnreadCount(response.data.unreadCount ?? 0);
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message ?? 'Failed to load notifications';
      console.error('Failed to fetch notifications:', err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Reset + reconnect whenever the logged-in user changes ───────────────
  useEffect(() => {
    // Clear previous user's data immediately
    setNotifications([]);
    setUnreadCount(0);
    setIsOpen(false);

    // Disconnect any existing socket
    socketRef.current?.disconnect();
    socketRef.current = null;

    if (!user?.id) return;

    // Initial REST fetch
    fetchNotifications();

    // Fallback polling every 60 s (real-time socket is primary)
    const interval = setInterval(fetchNotifications, 60_000);

    // ── WebSocket connection to /notifications namespace ──────────────────
    const token = getToken();
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

      // Real-time push: prepend new notification and bump unread count
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
  }, [user?.id, fetchNotifications]);

  // ─── Close dropdown on outside click ─────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
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
              {loading && notifications.length === 0 ? (
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
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !notification.isRead) markAsRead(notification.id);
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
                    fetchNotifications();
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
