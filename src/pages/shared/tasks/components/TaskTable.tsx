import { useState, useEffect } from 'react'
import type { Task, TaskStatus } from '../types/task.types'
import TaskRow from './TaskRow'
import TaskStatusComponent from './TaskStatus'
import TaskPriority from './TaskPriority'
import TaskActions from './TaskActions'
import TaskProgressBar from '../../../../components/shared/TaskProgressBar'
import TaskTypeBadge from '../../../../components/shared/TaskTypeBadge'
import { useAuth } from '../../../../context/AuthContext'

interface Props {
  tasks: Task[]
  loading: boolean
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onEdit: (taskId: string) => void
  onDelete: (taskId: string) => void
}

const TaskTable = ({
  tasks,
  loading,
  onStatusChange,
  onEdit,
  onDelete,
}: Props) => {
  const { user } = useAuth()
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        Loading tasks...
      </div>
    )
  }

  if (!tasks.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        No tasks found
      </div>
    )
  }

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'transparent' }}>
        {tasks.map((task) => {
          const assigneeName = task.assignee
            ? `${task.assignee.firstName} ${task.assignee.lastName}`
            : 'Unassigned'
          const deadline = task.dueDate
            ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            : 'No deadline'

          const showProgressBar = user?.role === 'EMPLOYEE'

          const handleStatusToggle = (e: React.MouseEvent) => {
            e.stopPropagation()
            const newStatus: TaskStatus =
              task.status === 'COMPLETED'
                ? 'IN_PROGRESS'
                : 'COMPLETED'
            onStatusChange(task.id, newStatus)
          }

          const handleCardClick = () => {
            const isAdmin = window.location.pathname.startsWith('/admin')
            const basePath = isAdmin ? '/admin/tasks' : '/app/tasks'
            window.location.href = `${basePath}/${task.id}`
          }

          return (
            <div
              key={task.id}
              onClick={handleCardClick}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid #f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.03)'
              }}
            >
              {/* Header Row: Title & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a', lineHeight: '1.4' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px', fontWeight: 500 }}>
                    {task.project?.name || 'No Project'}
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <TaskActions
                    taskId={task.id}
                    task={{ type: task.type, status: task.status, createdById: task.createdById }}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              </div>

              {showProgressBar && (
                <div style={{ margin: '4px 0' }} onClick={(e) => e.stopPropagation()}>
                  <TaskProgressBar status={task.status} />
                </div>
              )}

              {/* Middle Row: Assignee & Type */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f5f5', paddingTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: '1px solid #e5e7eb'
                  }}>
                    {task.assignee ? `${task.assignee.firstName[0]}${task.assignee.lastName[0]}`.toUpperCase() : '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                      {assigneeName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      Assignee
                    </div>
                  </div>
                </div>

                <TaskTypeBadge type={task.type} status={task.status} />
              </div>

              {/* Footer Row: Priority, Status, Deadline */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px', borderTop: '1px solid #f5f5f5', paddingTop: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <TaskPriority priority={task.priority} />
                  <div onClick={handleStatusToggle} style={{ cursor: 'pointer' }}>
                    <TaskStatusComponent status={task.status} />
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>📅</span>
                  <span>{deadline}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
      }}
    >
      <thead>
        <tr
          style={{
            textAlign: 'left',
            fontSize: '12px',
            color: '#666',
            fontWeight: 500,
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <th style={{ padding: '16px 20px' }}>Task Title</th>
          <th style={{ padding: '16px 20px' }}>Project</th>
          <th style={{ padding: '16px 20px' }}>Assigned To</th>
          <th style={{ padding: '16px 20px' }}>Type</th>
          <th style={{ padding: '16px 20px' }}>Priority</th>
          <th style={{ padding: '16px 20px' }}>Status</th>
          <th style={{ padding: '16px 20px' }}>Deadline</th>
          <th style={{ padding: '16px 20px', textAlign: 'right' }}>
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  )
}

export default TaskTable