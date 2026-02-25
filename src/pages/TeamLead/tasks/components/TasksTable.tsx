import { useNavigate } from 'react-router-dom'
import api from '../../../../utils/api'

interface Task {
  id: string
  title: string
  project: string
  assignedTo: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'todo' | 'in-progress' | 'review' | 'completed'
  dueDate: string
  progress: number
}

interface TasksTableProps {
  tasks: Task[]
  role?: string
}

const TasksTable = ({ tasks, role }: TasksTableProps) => {
  const navigate = useNavigate()

  ////////////////////////////////////////////////////////////////
  // STATUS UPDATE (EMPLOYEE + TEAM_LEAD)
  ////////////////////////////////////////////////////////////////

  const handleStatusChange = async (
    taskId: string,
    newStatus: string
  ) => {
    try {
      await api.patch(`/tasks/${taskId}`, {
        status: mapToBackendStatus(newStatus),
      })

      window.location.reload() // simple refresh for now
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  const mapToBackendStatus = (status: string) => {
    switch (status) {
      case 'todo':
        return 'TODO'
      case 'in-progress':
        return 'IN_PROGRESS'
      case 'review':
        return 'REVIEW'
      case 'completed':
        return 'COMPLETED'
      default:
        return status.toUpperCase()
    }
  }

  ////////////////////////////////////////////////////////////////

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { label: 'Urgent', color: '#ef4444', bg: '#fee2e2' }
      case 'high':
        return { label: 'High', color: '#f59e0b', bg: '#fef3c7' }
      case 'medium':
        return { label: 'Medium', color: '#4a90e2', bg: '#dbeafe' }
      case 'low':
        return { label: 'Low', color: '#10b981', bg: '#d1fae5' }
      default:
        return { label: priority, color: '#666666', bg: '#f5f5f5' }
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'todo':
        return { label: 'To Do', color: '#666666', bg: '#f5f5f5' }
      case 'in-progress':
        return { label: 'In Progress', color: '#4a90e2', bg: '#dbeafe' }
      case 'review':
        return { label: 'Review', color: '#f59e0b', bg: '#fef3c7' }
      case 'completed':
        return { label: 'Completed', color: '#10b981', bg: '#d1fae5' }
      default:
        return { label: status, color: '#666666', bg: '#f5f5f5' }
    }
  }

  ////////////////////////////////////////////////////////////////

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e5e5',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '100px 1fr 140px 120px 100px 130px 100px 120px',
        gap: '12px',
        padding: '16px 20px',
        background: '#fafafa',
        borderBottom: '1px solid #e5e5e5',
        fontSize: '13px',
        fontWeight: 600,
        color: '#666',
      }}>
        <div>Task ID</div>
        <div>Task Title</div>
        <div>Project</div>
        <div>Assigned To</div>
        <div>Priority</div>
        <div>Status</div>
        <div>Due Date</div>
        <div>Progress</div>
      </div>

      {/* Rows */}
      {tasks.map((task) => {
        const priorityConfig = getPriorityConfig(task.priority)
        const statusConfig = getStatusConfig(task.status)

        return (
          <div
            key={task.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr 140px 120px 100px 130px 100px 120px',
              gap: '12px',
              padding: '16px 20px',
              borderBottom: '1px solid #f5f5f5',
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/app/tasks/${task.id}`)}
          >
            <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}>
              {task.id.slice(0, 8)}
            </div>

            <div style={{ fontSize: '14px', fontWeight: 500 }}>
              {task.title}
            </div>

            <div style={{ fontSize: '12px', color: '#666' }}>
              {task.project}
            </div>

            <div style={{ fontSize: '12px', color: '#666' }}>
              {task.assignedTo}
            </div>

            <div>
              <span style={{
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 600,
                color: priorityConfig.color,
                background: priorityConfig.bg,
                textTransform: 'uppercase',
              }}>
                {priorityConfig.label}
              </span>
            </div>

            {/* STATUS COLUMN */}
            <div onClick={(e) => e.stopPropagation()}>
              {role === 'EMPLOYEE' ? (
                <select
                  value={task.status}
                  onChange={(e) =>
                    handleStatusChange(task.id, e.target.value)
                  }
                  style={{
                    padding: '4px 6px',
                    fontSize: '11px',
                    borderRadius: '6px',
                  }}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              ) : (
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: statusConfig.color,
                  background: statusConfig.bg,
                }}>
                  {statusConfig.label}
                </span>
              )}
            </div>

            <div style={{ fontSize: '12px', color: '#666' }}>
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString()
                : '-'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  flex: 1,
                  height: '6px',
                  background: '#f5f5f5',
                  borderRadius: '3px',
                }}>
                  <div style={{
                    width: `${task.progress}%`,
                    height: '100%',
                    background: task.progress === 100 ? '#10b981' : '#4a90e2',
                  }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600 }}>
                  {task.progress}%
                </span>
              </div>
            </div>
          </div>
        )
      })}

      {tasks.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#666',
        }}>
          No tasks found
        </div>
      )}
    </div>
  )
}

export default TasksTable