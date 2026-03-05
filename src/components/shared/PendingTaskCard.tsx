import type { Task } from '../../types/task';
import { useAuth } from '../../context/AuthContext';
import TaskTypeBadge from './TaskTypeBadge';
import ApprovalActions from './ApprovalActions';

interface PendingTaskCardProps {
  task: Task;
  onApprove: () => void;
  onReject: () => void;
}

const PendingTaskCard = ({ task, onApprove, onReject }: PendingTaskCardProps) => {
  const { user } = useAuth();

  // Determine if user can approve
  // Admins can approve all tasks, Team Leads can approve tasks in their projects
  const canApprove = user?.role === 'ADMIN' || user?.role === 'TEAM_LEAD';

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      padding: '16px',
      background: '#ffffff',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      e.currentTarget.style.borderColor = '#d1d5db';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = '#e5e7eb';
    }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{ flex: 1 }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#1a1a1a',
            margin: '0 0 8px 0',
            letterSpacing: '-0.01em',
          }}>
            {task.title}
          </h4>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}>
            <TaskTypeBadge type={task.type} status={task.status} />
            {task.project && (
              <span style={{
                fontSize: '12px',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span>📁</span>
                <span>{task.project.name}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {task.description && (
        <p style={{
          fontSize: '14px',
          color: '#4b5563',
          lineHeight: '1.6',
          margin: '0 0 12px 0',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {task.description}
        </p>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '13px',
        color: '#6b7280',
        marginBottom: '12px',
      }}>
        {task.creator && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span>👤</span>
            <span>
              {task.creator.firstName} {task.creator.lastName}
            </span>
          </div>
        )}
        {task.priority && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span>
              {task.priority === 'HIGH' ? '🔴' : task.priority === 'MEDIUM' ? '🟡' : '🟢'}
            </span>
            <span>{task.priority}</span>
          </div>
        )}
        {task.dueDate && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span>📅</span>
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <ApprovalActions
        task={task}
        onApprove={onApprove}
        onReject={onReject}
        canApprove={canApprove}
      />
    </div>
  );
};

export default PendingTaskCard;
