interface TaskFiltersProps {
  projectFilter: string
  statusFilter: string
  priorityFilter: string
  projects: string[]
  onProjectChange: (value: string) => void
  onStatusChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onCreateTask: () => void
    isTeamLead: boolean  
}

const TaskFilters = ({
  projectFilter,
  statusFilter,
  priorityFilter,
  projects,
  onProjectChange,
  onStatusChange,
  onPriorityChange,
  onCreateTask,
}: TaskFiltersProps) => {
  return (
    <div style={{
      background: '#ffffff',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #e5e5e5',
      marginBottom: '24px',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '8px',
          }}>
            Project
          </label>
          <select
            value={projectFilter}
            onChange={(e) => onProjectChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '14px',
              background: '#fafafa',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="all">All Projects</option>
            {projects.filter(p => p !== 'all').map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '8px',
          }}>
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '14px',
              background: '#fafafa',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '8px',
          }}>
            Priority
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '14px',
              background: '#fafafa',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={onCreateTask}
            style={{
              width: '100%',
              padding: '10px 20px',
              background: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#333333'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
          >
            + Create Task
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskFilters
