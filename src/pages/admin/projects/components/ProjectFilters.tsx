import React from 'react'
import { ProjectStatus, formatEnumLabel } from '../../../../types/enums'

interface EmployeeOption {
  id: string
  name: string
}

interface ProjectFilterValues {
  status?: string
  ownerId?: string
  memberId?: string
  startDate?: string
  endDate?: string
}

interface Props {
  employees: EmployeeOption[]
  filters: ProjectFilterValues
  onFilterChange: (filters: any) => void
}

const ProjectFilters = ({ employees, filters, onFilterChange }: Props) => {
  const handleChange = (key: keyof ProjectFilterValues, value: string) => {
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
      {/* Status Filter */}
      <select
        style={selectStyle}
        value={filters.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
      >
        <option value="">All Status</option>
        {Object.values(ProjectStatus).map((status) => (
          <option key={status} value={status}>
            {formatEnumLabel(status)}
          </option>
        ))}
      </select>

      {/* Team Lead / Owner Filter */}
      <select
        style={selectStyle}
        value={filters.ownerId || ''}
        onChange={(e) => handleChange('ownerId', e.target.value)}
      >
        <option value="">All Team Leads</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.name}
          </option>
        ))}
      </select>

      {/* Member Filter */}
      <select
        style={selectStyle}
        value={filters.memberId || ''}
        onChange={(e) => handleChange('memberId', e.target.value)}
      >
        <option value="">All Members</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.name}
          </option>
        ))}
      </select>

      {/* Start Date */}
      <input
        type="date"
        placeholder="Start Date"
        style={selectStyle}
        value={filters.startDate || ''}
        onChange={(e) => handleChange('startDate', e.target.value)}
      />

      {/* End Date */}
      <input
        type="date"
        placeholder="End Date"
        style={selectStyle}
        value={filters.endDate || ''}
        onChange={(e) => handleChange('endDate', e.target.value)}
      />

      {/* Clear Button */}
      <button
        style={clearButtonStyle}
        onClick={() => onFilterChange({ __clear: true })}
      >
        Clear
      </button>
    </div>
  )
}

export default ProjectFilters

const selectStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  background: '#fff',
  fontSize: '14px',
  color: '#1a1a1a',
  cursor: 'pointer',
  outline: 'none',
  minWidth: '160px',
  transition: 'all 0.2s ease',
}

const clearButtonStyle: React.CSSProperties = {
  padding: '10px 18px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  background: '#fff',
  fontSize: '14px',
  color: '#666',
  cursor: 'pointer',
  fontWeight: 500,
  transition: 'all 0.2s ease',
}
