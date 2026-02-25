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
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="CRITICAL">Critical</option>
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
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
        <option value="CLOSED">Closed</option>
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