import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAuthHeaders } from '../../../utils/auth'
import type { Employee } from './types/employee.types'

const API_URL = 'http://localhost:3000'

const EmployeeDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchEmployee(id)
    }
  }, [id])

  const fetchEmployee = async (employeeId: string) => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}/users/${employeeId}`, {
        headers: {
          ...getAuthHeaders(),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch employee details')
      }

      const data = await response.json()
      setEmployee(data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return (
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <p>Loading employee details...</p>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            padding: '12px',
            background: '#fff5f5',
            color: '#dc2626',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          {error || 'Employee not found'}
        </div>
        <button
          onClick={() => navigate('/admin/employees')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: '1px solid #e5e5e5',
            backgroundColor: '#fff',
            color: '#1a1a1a',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          ← Back to Employees
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header with Back Button */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/admin/employees')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid #e5e5e5',
            backgroundColor: '#fff',
            color: '#1a1a1a',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          ← Back to Employees
        </button>

        <h1
          style={{
            fontSize: '28px',
            fontWeight: 600,
            marginBottom: 4,
            color: '#1a1a1a',
          }}
        >
          Employee Details
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Complete profile information for {employee.firstName} {employee.lastName}
        </p>
      </div>

      {/* Profile Card */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e5e5',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        {/* Profile Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #e5e5e5',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '32px',
              color: '#374151',
            }}
          >
            {employee.profilePhoto ? (
              <img
                src={employee.profilePhoto}
                alt="profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              employee.firstName?.[0]
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
              {employee.firstName} {employee.lastName}
            </h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span
                style={{
                  color: getStatusColor(employee.status),
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                {employee.status}
              </span>
              {employee.designation && (
                <>
                  <span style={{ color: '#d1d5db' }}>•</span>
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    {employee.designation}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div style={{ padding: '24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Contact Information */}
            <div>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  color: '#1a1a1a',
                }}
              >
                Contact Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <DetailRow label="Email" value={employee.email} />
                <DetailRow label="Phone" value={employee.phone || '—'} />
                <DetailRow label="Department" value={employee.department || '—'} />
              </div>
            </div>

            {/* Employment Information */}
            <div>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  color: '#1a1a1a',
                }}
              >
                Employment Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <DetailRow
                  label="Joined Date"
                  value={
                    employee.joinedAt
                      ? new Date(employee.joinedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '—'
                  }
                />
                <DetailRow
                  label="Last Login"
                  value={
                    employee.lastLoginAt
                      ? new Date(employee.lastLoginAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e5e5',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#1a1a1a',
            }}
          >
            Assigned Roles
          </h3>
        </div>
        <div style={{ padding: '24px' }}>
          {employee.roles && employee.roles.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {employee.roles.map((roleObj, index) => (
                <span
                  key={index}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    ...getRoleBadgeStyle(roleObj.role.name),
                  }}
                >
                  {roleObj.role.name}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', fontSize: '14px' }}>No roles assigned</p>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e5e5',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#1a1a1a',
            }}
          >
            Skills
          </h3>
        </div>
        <div style={{ padding: '24px' }}>
          {employee.skills && employee.skills.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {employee.skills.map((skillObj) => (
                <span
                  key={skillObj.skill.id}
                  style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  {skillObj.skill.name}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', fontSize: '14px' }}>No skills assigned</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper component for detail rows
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
      {label}
    </div>
    <div style={{ fontSize: '14px', color: '#333', fontWeight: 500 }}>
      {value}
    </div>
  </div>
)

export default EmployeeDetail
