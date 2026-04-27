import { useState, useEffect } from 'react'
import { getEmployeeCost } from '../finance.api'
import type { EmployeeCostData } from '../finance.api'
import { getEmployeeOptions } from '../lookup.api'
import type { EmployeeOption } from '../lookup.api'
import { formatCurrency } from '../finance.utils'

const EmployeeCost = () => {
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [data, setData] = useState<EmployeeCostData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load employee list once
  useEffect(() => {
    getEmployeeOptions()
      .then(setEmployees)
      .catch(() => {})
  }, [])

  // Fetch cost whenever selected employee changes
  useEffect(() => {
    if (!selectedEmployeeId) { setData(null); return }

    setLoading(true)
    setError(null)
    getEmployeeCost(selectedEmployeeId)
      .then(setData)
      .catch((err: any) => setError(err.response?.data?.message || 'Failed to load employee cost'))
      .finally(() => setLoading(false))
  }, [selectedEmployeeId])

  const selected = employees.find((e) => e.id === selectedEmployeeId)
  const selectedName = selected ? `${selected.firstName} ${selected.lastName}` : ''

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e5e5',
      borderRadius: '12px',
      padding: '24px',
    }}>
      {/* Header + selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>Employee Salary Cost</div>
          {selectedName && (
            <div style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>{selectedName}</div>
          )}
        </div>

        <select
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #e5e5e5',
            fontSize: '14px',
            color: '#1a1a1a',
            background: '#fff',
            cursor: 'pointer',
            outline: 'none',
            minWidth: '220px',
          }}
        >
          <option value="">Select an employee</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.firstName} {e.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Empty state */}
      {!selectedEmployeeId && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#bbb', fontSize: '14px' }}>
          Select an employee to view their total salary cost.
        </div>
      )}

      {/* Loading */}
      {selectedEmployeeId && loading && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#999', fontSize: '14px' }}>
          Loading...
        </div>
      )}

      {/* Error */}
      {selectedEmployeeId && !loading && error && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Result card */}
      {!loading && !error && data && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}>
          {/* Total Salary */}
          <div
            style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              padding: '20px 24px',
            }}
          >
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Salary Cost
            </div>
            <div style={{ fontSize: '32px', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>
              {formatCurrency(data.totalSalary)}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
              All SALARY type expenses
            </div>
          </div>

          {/* Employee info */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '12px',
              padding: '20px 24px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d4d4d4'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e5e5'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Employee
            </div>
            <div style={{ fontSize: '22px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.01em' }}>
              {selectedName}
            </div>
            {data.totalSalary === 0 && (
              <div style={{ fontSize: '12px', color: '#bbb', marginTop: '8px' }}>
                No salary records found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeCost
