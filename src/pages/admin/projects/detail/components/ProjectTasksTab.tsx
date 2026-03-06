import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateTaskModal from '../../../tasks/components/CreateTaskModal'

interface Props {
  project: any
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

const ProjectTasksTab = ({ project, onTaskCreated }: Props) => {
  const navigate = useNavigate()
  const tasks = project.tasks || []
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleTaskCreated = () => {
    setIsModalOpen(false)
    if (onTaskCreated) {
      onTaskCreated()
    }
  }

  const getTasksByStatus = (status: string) =>
    tasks.filter((task: any) => task.status === status)

  return (
    <div>
      {/* Header with Create Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#1a1a1a',
            margin: '0 0 4px 0'
          }}>
            Tasks ({tasks.length})
          </h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            All tasks assigned to this project
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#333333'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1a1a1a'
          }}
        >
          + Create Task
        </button>
      </div>

      {/* Kanban Board */}
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
                {columnTasks.map((task: any) => (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/admin/tasks/${task.id}`, { 
                      state: { fromProject: project.id, fromProjectName: project.name } 
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
                      {task.assignedTo
                        ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
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

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        task={null}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleTaskCreated}
        defaultProjectId={project.id}
      />
    </div>
  )
}

export default ProjectTasksTab
