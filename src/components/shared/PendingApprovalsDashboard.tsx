import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPendingApprovals } from '../../utils/api';
import type { Task } from '../../types/task';
import PendingTaskCard from './PendingTaskCard.js';

const PendingApprovalsDashboard = () => {
  const { user } = useAuth();
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Only TEAM_LEAD and ADMIN can view pending approvals
  if (!user || user.role === 'EMPLOYEE') {
    return null;
  }

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const tasks = await getPendingApprovals();
      // Sort by creation date (newest first)
      const sortedTasks = tasks.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      setPendingTasks(sortedTasks);
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleApprove = () => {
    fetchPendingApprovals();
  };

  const handleReject = () => {
    fetchPendingApprovals();
  };

  if (loading) {
    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#1a1a1a',
          margin: 0,
          letterSpacing: '-0.01em',
        }}>
          Pending Approvals
        </h3>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '28px',
          height: '28px',
          padding: '0 8px',
          borderRadius: '14px',
          background: pendingTasks.length > 0 ? '#fef3c7' : '#f3f4f6',
          color: pendingTasks.length > 0 ? '#92400e' : '#6b7280',
          fontSize: '14px',
          fontWeight: 600,
        }}>
          {pendingTasks.length}
        </span>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {pendingTasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#9ca3af',
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '12px',
            }}>
              ✓
            </div>
            <p style={{
              fontSize: '14px',
              margin: 0,
            }}>
              No pending approvals
            </p>
          </div>
        ) : (
          pendingTasks.map(task => (
            <PendingTaskCard
              key={task.id}
              task={task}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PendingApprovalsDashboard;
