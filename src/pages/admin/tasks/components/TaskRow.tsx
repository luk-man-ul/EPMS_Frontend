import type { Task, TaskStatus } from '../types/task.types'
import TaskStatusComponent from './TaskStatus'
import TaskPriority from './TaskPriority'
import TaskActions from './TaskActions'

interface Props {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onEdit: (taskId: string) => void
  onDelete: (taskId: string) => void
}

const TaskRow = ({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}: Props) => {
  const assigneeName = task.assignee
    ? `${task.assignee.firstName} ${task.assignee.lastName}`
    : '—'

  const deadline = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : '—'

  const handleStatusToggle = () => {
    const newStatus: TaskStatus =
      task.status === 'COMPLETED'
        ? 'IN_PROGRESS'
        : 'COMPLETED'

    onStatusChange(task.id, newStatus)
  }

  return (
    <tr
      style={{
        borderBottom: '1px solid #f5f5f5',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = '#fafafa')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = 'transparent')
      }
    >
      <td style={{ padding: '16px 20px' }}>
        <div style={{ fontWeight: 500, color: '#1a1a1a', fontSize: '14px' }}>
          {task.title}
        </div>
      </td>

      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666' }}>
        {task.project?.name}
      </td>

      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#1a1a1a' }}>
        {assigneeName}
      </td>

      <td style={{ padding: '16px 20px' }}>
        <TaskPriority priority={task.priority} />
      </td>

      <td style={{ padding: '16px 20px', cursor: 'pointer' }}>
        <div onClick={handleStatusToggle}>
          <TaskStatusComponent status={task.status} />
        </div>
      </td>

      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666' }}>
        {deadline}
      </td>

      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
        <TaskActions
          taskId={task.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </tr>
  )
}

export default TaskRow