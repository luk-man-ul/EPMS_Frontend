import type { Employee } from '../types/employee.types'
import EmployeeStatusBadge from './EmployeeStatus'
import EmployeeActions from './EmployeeActions'

interface Props {
  employee: Employee
  onRefresh: () => void
}

const EmployeeRow = ({ employee, onRefresh }: Props) => {
  const fullName = `${employee.firstName} ${employee.lastName}`
  const roleNames =
    employee.roles?.map((r) => r.role.name).join(', ') || '—'

  return (
    <tr
      style={{
        borderBottom: '1px solid #f5f5f5',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = '#fafafa')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = 'transparent')
      }
    >
      {/* Name + Email */}
      <td style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            {employee.firstName?.[0] ?? '?'}
          </div>

          <div>
            <div style={{ fontWeight: 500, color: '#1a1a1a', fontSize: '14px' }}>
              {fullName}
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
              {employee.email}
            </div>
          </div>
        </div>
      </td>

      {/* Role */}
      <td style={{ padding: '16px 20px', fontSize: '14px' }}>
        {roleNames}
      </td>

      {/* Status */}
      <td style={{ padding: '16px 20px' }}>
        <EmployeeStatusBadge status={employee.status} />
      </td>

      {/* Actions */}
      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
        <EmployeeActions employee={employee} onRefresh={onRefresh} />
      </td>
    </tr>
  )
}

export default EmployeeRow
