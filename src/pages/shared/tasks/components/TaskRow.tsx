import type { Task, TaskStatus } from '../types/task.types'
import TaskStatusComponent from './TaskStatus'
import TaskPriority from './TaskPriority'
import TaskActions from './TaskActions'
import TaskProgressBar from '../../../../components/shared/TaskProgressBar'
import { useAuth } from '../../../../context/AuthContext'

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
  const { user } = useAuth()
  const assigneeName = task.assignee
    ? `${task.assignee.firstName} ${task.assignee.lastName}`
    : '—'

  const deadline = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : '—'
  
  // Show progress bar only for EMPLOYEE role
  const showProgressBar = user?.role === 'EMPLOYEE'

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation() // prevent row click

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
        cursor: 'pointer', // show clickable
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = '#fafafa')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = 'transparent')
      }
      onClick={() => {
        // Navigate to task details
        const isAdmin = window.location.pathname.startsWith('/admin')
        const basePath = isAdmin ? '/admin/tasks' : '/app/tasks'
        window.location.href = `${basePath}/${task.id}`
      }}
    >
      <td style={{ padding: '16px 20px' }}>
        <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: showProgressBar ? '8px' : '0' }}>
          {task.title}
        </div>
        {showProgressBar && (
          <TaskProgressBar status={task.status} />
        )}
      </td>

      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666' }}>
        {task.project?.name}
      </td>

      <td style={{ padding: '16px 20px', fontSize: '14px' }}>
        {assigneeName}
      </td>

      <td style={{ padding: '16px 20px' }}>
        <TaskPriority priority={task.priority} />
      </td>

      <td style={{ padding: '16px 20px' }}>
        <div onClick={handleStatusToggle}>
          <TaskStatusComponent status={task.status} />
        </div>
      </td>

      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666' }}>
        {deadline}
      </td>

      <td
        style={{ padding: '16px 20px', textAlign: 'right' }}
        onClick={(e) => e.stopPropagation()} // prevent row click
      >
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