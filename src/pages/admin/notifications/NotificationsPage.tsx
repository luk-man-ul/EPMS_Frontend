import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../utils/api'
import NotificationFilters from './components/NotificationFilters'
import NotificationItem from './components/NotificationItem'
import NotificationStats from './components/NotificationStats'
import type { NotificationType, Notification } from './types/notification.types'

// Map API notification type to local NotificationType
const mapType = (apiType: string): NotificationType => {
  if (apiType === 'TASK_ASSIGNED' || apiType === 'TASK_APPROVED' || apiType === 'TASK_REJECTED') return 'TASK_ASSIGNED'
  if (apiType === 'TICKET_UPDATED') return 'TICKET_UPDATE'
  if (apiType === 'WORK_APPROVAL_REQUESTED' || apiType === 'LEAVE_APPROVED' || apiType === 'LEAVE_REJECTED') return 'APPROVAL_REQUEST'
  return 'SYSTEM_ALERT'
}

// Map API notification to local Notification shape
const mapNotification = (n: any): Notification => ({
  id: n.id,
  type: mapType(n.type),
  priority: 'MEDIUM',
  title: n.title,
  message: n.message,
  timestamp: new Date(n.createdAt).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }),
  isRead: n.isRead,
  actionUrl: n.metadata?.taskId
    ? `/admin/tasks/${n.metadata.taskId}`
    : n.metadata?.ticketId
    ? `/admin/tickets/${n.metadata.ticketId}`
    : n.metadata?.projectId
    ? `/admin/projects/${n.metadata.projectId}`
    : n.metadata?.leaveId
    ? `/admin/leave`
    : undefined,
  metadata: n.metadata,
})

const NotificationsPage = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'ALL'>('ALL')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await api.get('/notifications')
      const raw = response.data.notifications || []
      setNotifications(raw.map(mapNotification))
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleClearAll = () => {
    setNotifications(prev => prev.filter(n => !n.isRead))
  }

  const handleAction = (url: string) => {
    navigate(url)
  }

  const filteredNotifications = activeFilter === 'ALL' 
    ? notifications 
    : notifications.filter(n => n.type === activeFilter)

  const unreadCount = notifications.filter(n => !n.isRead).length
  const taskCount = notifications.filter(n => n.type === 'TASK_ASSIGNED').length
  const ticketCount = notifications.filter(n => n.type === 'TICKET_UPDATE').length
  const approvalCount = notifications.filter(n => n.type === 'APPROVAL_REQUEST').length
  const alertCount = notifications.filter(n => n.type === 'SYSTEM_ALERT').length

  const unreadFiltered = filteredNotifications.filter(n => !n.isRead)
  const readFiltered = filteredNotifications.filter(n => n.isRead)

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 600, 
            marginBottom: 4,
            color: '#1a1a1a',
            letterSpacing: '-0.01em'
          }}>
            Notifications
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Stay updated with all your activities
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1px solid #e5e5e5',
                backgroundColor: '#fff',
                color: '#1a1a1a',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              Mark All as Read
            </button>
          )}
          <button
            onClick={handleClearAll}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
          >
            Clear Read
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
          Loading notifications...
        </div>
      ) : (
        <>

      {/* Stats */}
      <NotificationStats
        total={notifications.length}
        unread={unreadCount}
        taskAssigned={taskCount}
        ticketUpdates={ticketCount}
        approvalRequests={approvalCount}
        systemAlerts={alertCount}
      />

      {/* Filters */}
      <div style={{ marginBottom: '24px' }}>
        <NotificationFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          unreadCount={unreadCount}
        />
      </div>

      {/* Notifications List */}
      <div>
        {/* Unread Section */}
        {unreadFiltered.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                Unread
              </h3>
              <span style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: '#1a1a1a',
                color: '#fff'
              }}>
                {unreadFiltered.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {unreadFiltered.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onAction={handleAction}
                />
              ))}
            </div>
          </div>
        )}

        {/* Read Section */}
        {readFiltered.length > 0 && (
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#666', margin: 0 }}>
                Earlier
              </h3>
              <span style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: '#f0f0f0',
                color: '#666'
              }}>
                {readFiltered.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {readFiltered.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onAction={handleAction}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
              No notifications
            </h3>
            <p style={{ fontSize: '14px', color: '#666' }}>
              You're all caught up! Check back later for updates.
            </p>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  )
}

export default NotificationsPage
