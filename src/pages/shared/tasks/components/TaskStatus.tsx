import type { TaskStatus as TaskStatusType } from '../types/task.types'

interface Props {
  status: TaskStatusType
}

const statusConfig: Record<
  TaskStatusType,
  { bg: string; color: string; label: string }
> = {
  TODO: {
    bg: '#fafafa',
    color: '#666',
    label: 'To Do',
  },
  IN_PROGRESS: {
    bg: '#f0f0f0',
    color: '#1a1a1a',
    label: 'In Progress',
  },
  REVIEW: {
    bg: '#fafafa',
    color: '#666',
    label: 'Review',
  },
  COMPLETED: {
    bg: '#1a1a1a',
    color: '#fff',
    label: 'Completed',
  },
  CANCELLED: {
    bg: '#f5f5f5',
    color: '#999',
    label: 'Cancelled',
  },
  PROPOSED: {
    bg: '#fef3c7',
    color: '#92400e',
    label: 'Pending Approval',
  },
  REJECTED: {
    bg: '#fee2e2',
    color: '#991b1b',
    label: 'Rejected',
  },
}

const TaskStatus = ({ status }: Props) => {
  // Defensive fallback: if status is not in config, use TODO as default
  const config = statusConfig[status] || statusConfig.TODO

  return (
    <span
      style={{
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 500,
        backgroundColor: config.bg,
        color: config.color,
        border: '1px solid #e5e5e5',
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {config.label}
    </span>
  )
}

export default TaskStatus