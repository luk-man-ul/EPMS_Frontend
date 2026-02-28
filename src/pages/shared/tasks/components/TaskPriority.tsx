import type { TaskPriority as TaskPriorityType } from '../types/task.types'

interface Props {
  priority: TaskPriorityType
}

const priorityConfig = {
  LOW: { bg: '#fafafa', color: '#666', label: 'Low' },
  MEDIUM: { bg: '#f0f0f0', color: '#1a1a1a', label: 'Medium' },
  HIGH: { bg: '#1a1a1a', color: '#fff', label: 'High' },
  URGENT: { bg: '#1a1a1a', color: '#fff', label: 'Urgent' }
}

const TaskPriority = ({ priority }: Props) => {
  const config = priorityConfig[priority]
  
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
      }}
    >
      {config.label}
    </span>
  )
}

export default TaskPriority
