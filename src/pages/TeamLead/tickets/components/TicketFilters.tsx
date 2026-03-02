import { TicketStatus, Priority, TicketType, getEnumOptions } from '../../../../types/enums'

interface TicketFiltersProps {
  projectFilter: string
  assignedToFilter: string
  priorityFilter: string
  statusFilter: string
  typeFilter: string
  projects: string[]
  employees: string[]
  onProjectChange: (value: string) => void
  onAssignedToChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onStatusChange: (value: string) => void
  onTypeChange: (value: string) => void
  onCreateTicket: () => void
  userRole?: string
}

const TicketFilters = ({
  projectFilter,
  assignedToFilter,
  priorityFilter,
  statusFilter,
  typeFilter,
  projects,
  employees,
  onProjectChange,
  onAssignedToChange,
  onPriorityChange,
  onStatusChange,
  onTypeChange,
  onCreateTicket,
  userRole,
}: TicketFiltersProps) => {
  const priorityOptions = getEnumOptions(Priority)
  const statusOptions = getEnumOptions(TicketStatus)
  const typeOptions = getEnumOptions(TicketType)

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
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
            Assigned To
          </label>
          <select
            value={assignedToFilter}
            onChange={(e) => onAssignedToChange(e.target.value)}
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
            <option value="all">All Employees</option>
            {employees.filter(e => e !== 'all').map(employee => (
              <option key={employee} value={employee}>{employee}</option>
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
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value.toLowerCase()}>
                {option.label}
              </option>
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
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value.toLowerCase().replace(/_/g, '-')}>
                {option.label}
              </option>
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
            Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
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
            <option value="all">All Types</option>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value.toLowerCase()}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {userRole !== 'ADMIN' && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={onCreateTicket}
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
              + Create Ticket
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketFilters
