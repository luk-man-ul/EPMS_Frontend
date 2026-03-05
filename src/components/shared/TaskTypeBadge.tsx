import { TaskType, TaskStatus } from '../../types/enums';

interface TaskTypeBadgeProps {
  type: TaskType;
  status?: TaskStatus;
}

const TaskTypeBadge = ({ type, status }: TaskTypeBadgeProps) => {
  const getBadgeStyle = (): {
    bg: string;
    color: string;
    label: string;
  } => {
    if (type === TaskType.SELF_WORK) {
      // Yellow for PROPOSED status
      if (status === TaskStatus.PROPOSED) {
        return {
          bg: '#fef3c7',
          color: '#92400e',
          label: 'Pending Approval',
        };
      }
      // Red for REJECTED status
      if (status === TaskStatus.REJECTED) {
        return {
          bg: '#fee2e2',
          color: '#991b1b',
          label: 'Rejected',
        };
      }
      // Blue for approved SELF_WORK (any status other than PROPOSED/REJECTED)
      return {
        bg: '#eff6ff',
        color: '#2563eb',
        label: 'Self-Work',
      };
    }
    // Gray for ASSIGNED
    return {
      bg: '#f9fafb',
      color: '#4b5563',
      label: 'Assigned',
    };
  };

  const style = getBadgeStyle();

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 500,
        backgroundColor: style.bg,
        color: style.color,
        border: '1px solid #e5e5e5',
        whiteSpace: 'nowrap',
      }}
    >
      {style.label}
    </span>
  );
};

export default TaskTypeBadge;
