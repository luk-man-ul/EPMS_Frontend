import type { Employee } from '../types/employee.types'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Props {
  employees: Employee[]
  onPromote?: (id: string) => void
  onDemote?: (id: string) => void
  onDeactivate?: (id: string) => void
  onActivate?: (id: string) => void
  onEdit?: (employee: Employee) => void
}

const EmployeeTable = ({
  employees,
  onPromote,
  onDemote,
  onDeactivate,
  onActivate,
  onEdit,
}: Props) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node)
    ) {
      setOpenMenuId(null)
    }
  }

  document.addEventListener('mousedown', handleClickOutside)

  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [])


  if (!employees.length) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#777' }}>
        No employees found.
      </div>
    )
  }

  const getPrimaryRole = (emp: Employee) => {
    const roleNames = emp.roles.map((r) => r.role.name)

    if (roleNames.includes('ADMIN')) return 'ADMIN'
    if (roleNames.includes('TEAM_LEAD')) return 'TEAM_LEAD'
    return 'EMPLOYEE'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#16a34a'
      case 'INACTIVE':
        return '#dc2626'
      case 'SUSPENDED':
        return '#f59e0b'
      default:
        return '#666'
    }
  }

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { backgroundColor: '#fee2e2', color: '#991b1b' }
      case 'TEAM_LEAD':
        return { backgroundColor: '#dbeafe', color: '#1e3a8a' }
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' }
    }
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: '#f9fafb' }}>
          <th style={thStyle}>Name</th>
          <th style={thStyle}>Joined</th>
          <th style={thStyle}>Role</th>
          <th style={thStyle}>Skills</th>
          <th style={thStyle}>Status</th>
          <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
        </tr>
      </thead>

      <tbody>
        {employees.map((emp) => {
          const role = getPrimaryRole(emp)

          return (
            <tr 
              key={emp.id} 
              style={{ 
                borderTop: '1px solid #eee',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              onClick={(e) => {
                // Don't navigate if clicking on the actions button or menu
                const target = e.target as HTMLElement
                if (!target.closest('button') && !target.closest('[data-menu]')) {
                  navigate(`/admin/employees/${emp.id}`)
                }
              }}
            >
              
              {/* Name + Avatar */}
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      color: '#374151',
                    }}
                  >
                    {emp.profilePhoto ? (
                      <img
                        src={emp.profilePhoto}
                        alt="profile"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      emp.firstName?.[0]
                    )}
                  </div>

                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {emp.firstName} {emp.lastName}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {emp.email}
                    </div>
                  </div>
                </div>
              </td>

              {/* Joined */}
              <td style={tdStyle}>
                {emp.joinedAt
                  ? new Date(emp.joinedAt).toLocaleDateString()
                  : '—'}
              </td>

              {/* Role */}
              <td style={tdStyle}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    ...getRoleBadgeStyle(role),
                  }}
                >
                  {role}
                </span>
              </td>

<td style={tdStyle}>
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
    {emp.skills?.map((s) => (
      <span
        key={s.skill.id}
        style={{
          background: '#e0f2fe',
          color: '#0369a1',
          padding: '4px 8px',
          borderRadius: 6,
          fontSize: 12,
        }}
      >
        {s.skill.name}
      </span>
    ))}
  </div>
</td>


              {/* Status */}
              <td style={tdStyle}>
                <span
                  style={{
                    color: getStatusColor(emp.status),
                    fontWeight: 600,
                  }}
                >
                  {emp.status}
                </span>
              </td>

              {/* Actions Dropdown */}
              <td
                style={{
                  ...tdStyle,
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <button
                  style={dotsBtn}
                  onClick={() =>
                    setOpenMenuId(openMenuId === emp.id ? null : emp.id)
                  }
                >
                  ⋮
                </button>

                {openMenuId === emp.id && (
  <div ref={menuRef} style={dropdownStyle} data-menu="true">

                    
                    {/* Edit */}
                    {onEdit && (
                      <div
                        style={menuItem}
                        onClick={() => {
                          onEdit(emp)
                          setOpenMenuId(null)
                        }}
                      >
                        Edit
                      </div>
                    )}

                    {/* Promote */}
                    {emp.status === 'ACTIVE' &&
                      role === 'EMPLOYEE' &&
                      onPromote && (
                        <div
                          style={menuItem}
                          onClick={() => {
                            onPromote(emp.id)
                            setOpenMenuId(null)
                          }}
                        >
                          Promote
                        </div>
                      )}

                    {/* Demote */}
                    {emp.status === 'ACTIVE' &&
                      role === 'TEAM_LEAD' &&
                      onDemote && (
                        <div
                          style={menuItem}
                          onClick={() => {
                            onDemote(emp.id)
                            setOpenMenuId(null)
                          }}
                        >
                          Demote
                        </div>
                      )}

                    {/* Deactivate */}
                    {emp.status === 'ACTIVE' &&
                      role !== 'ADMIN' &&
                      onDeactivate && (
                        <div
                          style={{ ...menuItem, color: '#dc2626' }}
                          onClick={() => {
                            onDeactivate(emp.id)
                            setOpenMenuId(null)
                          }}
                        >
                          Deactivate
                        </div>
                      )}

                    {/* Activate */}
                    {emp.status === 'INACTIVE' &&
                      onActivate && (
                        <div
                          style={{ ...menuItem, color: '#16a34a' }}
                          onClick={() => {
                            onActivate(emp.id)
                            setOpenMenuId(null)
                          }}
                        >
                          Activate
                        </div>
                      )}
                  </div>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

/* ---------- Styles ---------- */

const thStyle = {
  textAlign: 'left' as const,
  padding: '12px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#111',
}

const tdStyle = {
  padding: '12px',
  fontSize: '14px',
  color: '#333',
}

const dotsBtn = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '18px',
}

const dropdownStyle = {
  position: 'absolute' as const,
  right: '60%',          // 👈 move dropdown to left of button
  bottom:10,                 // 👈 align vertically with button
  background: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: 8,
  padding: 1,
  minWidth: 150,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  zIndex: 9999,
}


const menuItem = {
  padding: '8px 10px',
  cursor: 'pointer',
  fontSize: '13px',
  borderRadius: 6,
}

export default EmployeeTable
