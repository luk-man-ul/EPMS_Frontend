import { Priority, TicketStatus } from '../../../../types/enums'

interface ProjectOption {
  id: string
  name: string
}

interface EmployeeOption {
  id: string
  name: string
}

interface Props {
  projects: ProjectOption[]
  employees: EmployeeOption[]
  filters: any
  onFilterChange: (filters: any) => void
}

const TicketFilters = ({
  projects,
  employees,
  filters,
  onFilterChange,
}: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '20px',
      }}
    >
      {/* Project Filter */}
      <select
        style={selectStyle}
        value={filters.projectId || ''}
        onChange={(e) =>
          onFilterChange({ projectId: e.target.value })
        }
      >
        <option value="">All Projects</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>

      {/* Priority Filter */}
      <select
        style={selectStyle}
        value={filters.priority || ''}
        onChange={(e) =>
          onFilterChange({ priority: e.target.value })
        }
      >
        <option value="">All Priority</option>
        <option value={Priority.LOW}>Low</option>
        <option value={Priority.MEDIUM}>Medium</option>
        <option value={Priority.HIGH}>High</option>
        <option value={Priority.URGENT}>Urgent</option>
      </select>

      {/* Status Filter */}
      <select
        style={selectStyle}
        value={filters.status || ''}
        onChange={(e) =>
          onFilterChange({ status: e.target.value })
        }
      >
        <option value="">All Status</option>
        <option value={TicketStatus.OPEN}>Open</option>
        <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
        <option value={TicketStatus.WAITING_FOR_USER}>Waiting For User</option>
        <option value={TicketStatus.RESOLVED}>Resolved</option>
        <option value={TicketStatus.CLOSED}>Closed</option>
        <option value={TicketStatus.REJECTED}>Rejected</option>
        <option value={TicketStatus.REOPENED}>Reopened</option>
      </select>

      {/* Employee Filter */}
      <select
        style={selectStyle}
        value={filters.assignedToId || ''}
        onChange={(e) =>
          onFilterChange({ assignedToId: e.target.value })
        }
      >
        <option value="">All Employees</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.name}
          </option>
        ))}
      </select>

      {/* Clear Button */}
      <button
        style={clearButtonStyle}
        onClick={() => onFilterChange({ __clear: true })}
      >
        Clear Filters
      </button>
    </div>
  )
}

export default TicketFilters

//////////////////////////////////////////////////////////

const selectStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid #e5e5e5',
  background: '#fff',
  fontSize: '14px',
  color: '#1a1a1a',
  cursor: 'pointer',
  outline: 'none',
}

const clearButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid #e5e5e5',
  background: '#fff',
  fontSize: '14px',
  color: '#666',
  cursor: 'pointer',
  fontWeight: 500,
}