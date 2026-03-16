import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateTaskModal from '../../../../admin/tasks/components/CreateTaskModal'

interface Props {
  tasks: any[]
  projectId?: string
  onTaskCreated?: () => void
}

const priorityColors: Record<string, string> = {
  LOW: '#16a34a',
  MEDIUM: '#2563eb',
  HIGH: '#d97706',
  URGENT: '#dc2626',
}

const columnConfig = [
  { id: 'TODO', title: 'Todo', color: '#6b7280' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#2563eb' },
  { id: 'REVIEW', title: 'Review', color: '#d97706' },
  { id: 'COMPLETED', title: 'Completed', color: '#16a34a' },
]

const TaskBoardTab = ({ tasks, projectId, onTaskCreated }: Props) => {
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)

  if (!tasks) return null

  const getTasksByStatus = (status: string) =>
    tasks.filter((task) => task.status === status)

  return (
    <>
      {/* Create Task Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '8px 18px',
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          + Create Task
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
        }}
      >
      {columnConfig.map((column) => {
        const columnTasks = getTasksByStatus(column.id)

        return (
          <div
            key={column.id}
            style={{
              background: '#f9fafb',
              borderRadius: 14,
              padding: 18,
              minHeight: 400,
              border: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* COLUMN HEADER */}
            <div
              style={{
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: column.color,
                }}
              >
                {column.title}
              </h3>

              <span
                style={{
                  background: '#e5e7eb',
                  padding: '4px 10px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {columnTasks.length}
              </span>
            </div>

            {/* TASK CARDS */}
            <div style={{ flex: 1 }}>
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => navigate(`/app/tasks/${task.id}`, {
                    state: { fromProject: task.projectId || projectId, fromProjectName: task.project?.name }
                  })}
                  style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 14,
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      '0 6px 18px rgba(0,0,0,0.08)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {/* TITLE */}
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      marginBottom: 8,
                      lineHeight: 1.4,
                    }}
                  >
                    {task.title}
                  </div>

                  {/* PRIORITY BADGE */}
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background:
                        priorityColors[task.priority] + '20' || '#eee',
                      color:
                        priorityColors[task.priority] || '#555',
                      marginBottom: 10,
                    }}
                  >
                    {task.priority}
                  </div>

                  {/* ASSIGNEE */}
                 <div style={{ fontSize: 12, color: '#555' }}>
  Assigned to:{' '}
  {task.assignee
    ? `${task.assignee.firstName} ${task.assignee.lastName}`
    : 'Unassigned'}
</div>

                  {/* DUE DATE */}
                  {task.dueDate && (
                    <div
                      style={{
                        fontSize: 12,
                        color: '#9ca3af',
                        marginTop: 4,
                      }}
                    >
                      Due:{' '}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}

              {/* EMPTY STATE */}
              {columnTasks.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: 13,
                    marginTop: 30,
                  }}
                >
                  No tasks in {column.title}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          setShowCreateModal(false)
          onTaskCreated?.()
        }}
        defaultProjectId={projectId}
      />
    </>
  )
}

export default TaskBoardTab