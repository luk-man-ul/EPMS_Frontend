import React from 'react'
import { TaskStatus, TaskType, formatEnumLabel } from '../../../../types/enums'

//////////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////////

interface ProjectOption {
  id: string
  name: string
}

interface EmployeeOption {
  id: string
  name: string
}

interface TaskFilterValues {
  projectId?: string
  type?: string
  status?: string
  priority?: string
  assignedToId?: string
  dueDate?: string
}

interface Props {
  projects: ProjectOption[]
  employees?: EmployeeOption[] // optional (TeamLead won't pass this)
  filters: TaskFilterValues
  onFilterChange: (filters: any) => void
  showCreateButton?: boolean
  onCreateTask?: () => void
}

//////////////////////////////////////////////////////////////
// COMPONENT
//////////////////////////////////////////////////////////////

const TaskFilters = ({
  projects,
  employees,
  filters,
  onFilterChange,
  showCreateButton,
  onCreateTask,
}: Props) => {
  const handleChange = (key: keyof TaskFilterValues, value: string) => {
    onFilterChange({ [key]: value })
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: '20px',
      }}
    >
      {/* Project Filter */}
      <select
        style={selectStyle}
        value={filters.projectId || ''}
        onChange={(e) =>
          handleChange('projectId', e.target.value)
        }
      >
        <option value="">All Projects</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>

      {/* Type Filter */}
      <select
        style={selectStyle}
        value={filters.type || ''}
        onChange={(e) =>
          handleChange('type', e.target.value)
        }
      >
        <option value="">All Types</option>
        <option value={TaskType.ASSIGNED}>Assigned Tasks</option>
        <option value={TaskType.SELF_WORK}>Self-Work Tasks</option>
      </select>

      {/* Status Filter */}
      <select
        style={selectStyle}
        value={filters.status || ''}
        onChange={(e) =>
          handleChange('status', e.target.value)
        }
      >
        <option value="">All Status</option>
        {Object.values(TaskStatus).map((status) => (
          <option key={status} value={status}>
            {formatEnumLabel(status)}
          </option>
        ))}
      </select>

      {/* Priority Filter */}
      <select
        style={selectStyle}
        value={filters.priority || ''}
        onChange={(e) =>
          handleChange('priority', e.target.value)
        }
      >
        <option value="">All Priority</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>

      {/* Employee Filter (only if provided) */}
      {employees && employees.length > 0 && (
        <select
          style={selectStyle}
          value={filters.assignedToId || ''}
          onChange={(e) =>
            handleChange('assignedToId', e.target.value)
          }
        >
          <option value="">All Users</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
      )}

      {/* Due Date */}
      <input
        type="date"
        style={selectStyle}
        value={filters.dueDate || ''}
        onChange={(e) =>
          handleChange('dueDate', e.target.value)
        }
      />

      {/* Clear Button */}
      <button
        style={clearButtonStyle}
        onClick={() => onFilterChange({ __clear: true })}
      >
        Clear
      </button>

      {/* Create Task Button (only for TeamLead) */}
      {showCreateButton && onCreateTask && (
        <button
          style={createButtonStyle}
          onClick={onCreateTask}
        >
          + Create Task
        </button>
      )}
    </div>
  )
}

export default TaskFilters

//////////////////////////////////////////////////////////////
// STYLES
//////////////////////////////////////////////////////////////

const selectStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  background: '#fff',
  fontSize: '14px',
  color: '#1a1a1a',
  cursor: 'pointer',
  outline: 'none',
}

const clearButtonStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  background: '#fff',
  fontSize: '14px',
  color: '#666',
  cursor: 'pointer',
  fontWeight: 500,
}

const createButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#111827',
  color: '#fff',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: 600,
}