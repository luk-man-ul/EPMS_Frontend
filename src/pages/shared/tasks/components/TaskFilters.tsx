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
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768)

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleChange = (key: keyof TaskFilterValues, value: string) => {
    onFilterChange({ [key]: value })
  }

  const mergedSelectStyle: React.CSSProperties = {
    ...selectStyle,
    width: isMobile ? '100%' : 'auto',
  }

  if (isMobile) {
    const isAnyFilterActive = 
      !!filters.projectId || 
      !!filters.type || 
      !!filters.status || 
      !!filters.priority || 
      !!filters.assignedToId || 
      !!filters.dueDate;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginBottom: '20px' }}>
        {/* Create Task Button (only for TeamLead/Admin) */}
        {showCreateButton && onCreateTask && (
          <button
            style={{
              ...createButtonStyle,
              width: '100%',
              padding: '10px 16px',
              borderRadius: '10px',
              textAlign: 'center',
            }}
            onClick={onCreateTask}
          >
            + Create Task
          </button>
        )}

        <style>{`
          .task-filters-pills::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div 
          className="task-filters-pills"
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: '8px',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Project filter pill */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select
              value={filters.projectId || ''}
              onChange={(e) => handleChange('projectId', e.target.value)}
              style={pillStyle(!!filters.projectId, true)}
            >
              <option value="">Project: All</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  Project: {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type filter pill */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select
              value={filters.type || ''}
              onChange={(e) => handleChange('type', e.target.value)}
              style={pillStyle(!!filters.type, true)}
            >
              <option value="">Type: All</option>
              <option value={TaskType.ASSIGNED}>Type: Assigned</option>
              <option value={TaskType.SELF_WORK}>Type: Self-Work</option>
            </select>
          </div>

          {/* Status filter pill */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select
              value={filters.status || ''}
              onChange={(e) => handleChange('status', e.target.value)}
              style={pillStyle(!!filters.status, true)}
            >
              <option value="">Status: All</option>
              {Object.values(TaskStatus).map((status) => (
                <option key={status} value={status}>
                  Status: {formatEnumLabel(status)}
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter pill */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select
              value={filters.priority || ''}
              onChange={(e) => handleChange('priority', e.target.value)}
              style={pillStyle(!!filters.priority, true)}
            >
              <option value="">Priority: All</option>
              <option value="LOW">Priority: Low</option>
              <option value="MEDIUM">Priority: Medium</option>
              <option value="HIGH">Priority: High</option>
              <option value="URGENT">Priority: Urgent</option>
            </select>
          </div>

          {/* Employee filter pill */}
          {employees && employees.length > 0 && (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select
                value={filters.assignedToId || ''}
                onChange={(e) => handleChange('assignedToId', e.target.value)}
                style={pillStyle(!!filters.assignedToId, true)}
              >
                <option value="">User: All</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    User: {emp.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Due date filter pill */}
          <div style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>DUE</span>
            <input
              type="date"
              value={filters.dueDate || ''}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              style={pillStyle(!!filters.dueDate)}
            />
          </div>

          {/* Clear button pill */}
          {isAnyFilterActive && (
            <button
              onClick={() => onFilterChange({ __clear: true })}
              style={{
                ...pillStyle(false),
                background: '#f1f5f9',
                borderColor: '#cbd5e1',
                color: '#475569',
                flexShrink: 0,
              }}
            >
              Clear ✕
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      style={
        isMobile
          ? {
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px',
            }
          : {
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: '20px',
            }
      }
    >
      {/* Project Filter */}
      <select
        style={mergedSelectStyle}
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
        style={mergedSelectStyle}
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
        style={mergedSelectStyle}
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
        style={mergedSelectStyle}
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
          style={mergedSelectStyle}
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
        style={mergedSelectStyle}
        value={filters.dueDate || ''}
        onChange={(e) =>
          handleChange('dueDate', e.target.value)
        }
      />

      {/* Clear Button */}
      <button
        style={{
          ...clearButtonStyle,
          width: isMobile ? '100%' : 'auto',
          gridColumn: isMobile ? 'span 2' : 'auto',
          textAlign: 'center',
        }}
        onClick={() => onFilterChange({ __clear: true })}
      >
        Clear
      </button>

      {/* Create Task Button (only for TeamLead) */}
      {showCreateButton && onCreateTask && (
        <button
          style={{
            ...createButtonStyle,
            width: isMobile ? '100%' : 'auto',
            gridColumn: isMobile ? 'span 2' : 'auto',
            textAlign: 'center',
          }}
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

const pillStyle = (isActive: boolean, isSelect: boolean = false): React.CSSProperties => ({
  flexShrink: 0,
  padding: isSelect ? '8px 28px 8px 14px' : '8px 14px',
  borderRadius: '9999px',
  border: isActive ? '1px solid #4f46e5' : '1px solid #cbd5e1',
  background: isActive 
    ? (isSelect 
        ? '#eef2ff url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%234f46e5\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 10px center / 12px' 
        : '#eef2ff')
    : (isSelect 
        ? '#fff url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%234b5563\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 10px center / 12px' 
        : '#fff'),
  color: isActive ? '#4f46e5' : '#374151',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  outline: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  fontFamily: 'inherit',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none',
  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
});