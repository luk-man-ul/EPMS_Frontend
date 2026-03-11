import { useState, useEffect } from 'react';
import { Card, Badge, LoadingSpinner, ErrorMessage } from '../ui';
import api from '../../utils/api';
import './ActivityFeed.css';

interface Activity {
  id: string;
  userId: string;
  actionType: string;
  description: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ActivityFeedProps {
  limit?: number;
  userId?: string;
  projectId?: string;
  title?: string;
}

export function ActivityFeed({ limit = 20, userId, projectId, title = 'Recent Activity' }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchActivities();
  }, [userId, projectId, limit]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = '/activities';
      if (userId) {
        endpoint = `/activities/user/${userId}`;
      } else if (projectId) {
        endpoint = `/activities/project/${projectId}`;
      }

      const response = await api.get(endpoint, {
        params: { limit },
      });

      setActivities(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch activities:', err);
      setError(err.response?.data?.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'TASK_ASSIGNED':
        return '📋';
      case 'LEAVE_APPROVED':
        return '✅';
      case 'LEAVE_REJECTED':
        return '❌';
      case 'TICKET_UPDATED':
        return '🎫';
      case 'TICKET_RESOLVED':
        return '✔️';
      case 'PROJECT_CREATED':
        return '📁';
      case 'WORK_APPROVAL_COMPLETED':
        return '📝';
      default:
        return '📌';
    }
  };

  const getActivityColor = (actionType: string) => {
    switch (actionType) {
      case 'TASK_ASSIGNED':
        return '#3b82f6';
      case 'LEAVE_APPROVED':
      case 'TICKET_RESOLVED':
      case 'WORK_APPROVAL_COMPLETED':
        return '#10b981';
      case 'LEAVE_REJECTED':
        return '#ef4444';
      case 'TICKET_UPDATED':
        return '#f59e0b';
      case 'PROJECT_CREATED':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const paginatedActivities = activities.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(activities.length / itemsPerPage);

  if (loading) {
    return (
      <Card padding="md">
        <h3 className="activity-feed-title">{title}</h3>
        <div className="activity-feed-loading">
          <LoadingSpinner text="Loading activities..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="md">
        <h3 className="activity-feed-title">{title}</h3>
        <ErrorMessage type="page" message={error} />
      </Card>
    );
  }

  return (
    <Card padding="md">
      <h3 className="activity-feed-title">{title}</h3>

      {activities.length === 0 ? (
        <div className="activity-feed-empty">
          <span className="empty-icon">📭</span>
          <p>No activities yet</p>
        </div>
      ) : (
        <>
          <div className="activity-feed-list">
            {paginatedActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div
                  className="activity-avatar"
                  style={{ backgroundColor: getActivityColor(activity.actionType) }}
                >
                  {getUserInitials(activity.user.firstName, activity.user.lastName)}
                </div>

                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-user">
                      {activity.user.firstName} {activity.user.lastName}
                    </span>
                    <span className="activity-description">{activity.description}</span>
                  </div>

                  <div className="activity-footer">
                    <span className="activity-icon">{getActivityIcon(activity.actionType)}</span>
                    <Badge
                      variant="default"
                      size="sm"
                      className="activity-badge"
                    >
                      {activity.entityType}
                    </Badge>
                    <span className="activity-time">{formatTime(activity.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="activity-feed-pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
