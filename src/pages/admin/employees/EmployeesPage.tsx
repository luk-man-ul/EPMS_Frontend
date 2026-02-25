import { useEffect, useState } from 'react'
import EmployeeTable from './components/EmployeeTable'
import { getAuthHeaders } from '../../../utils/auth'
import type { Employee } from './types/employee.types'
import EmployeeForm from './form/EmployeeForm'

const API_URL = 'http://localhost:3000'

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [search, setSearch] = useState('')
  const [skills, setSkills] = useState<any[]>([])



  useEffect(() => {
    fetchEmployees()
    fetchSkills()
  }, [])

const fetchSkills = async () => {
  try {
    const res = await fetch(`${API_URL}/skills`, {
      headers: { ...getAuthHeaders() },
    })

    const data = await res.json()
    setSkills(data)
  } catch (err) {
    console.error('Failed to fetch skills')
  }
}



  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}/users`, {
        headers: {
          ...getAuthHeaders(),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch employees')
      }

      const data = await response.json()
      setEmployees(data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const promoteUser = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/users/${id}/promote`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders() },
      })

      if (!res.ok) throw new Error('Failed to promote')

      fetchEmployees()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const demoteUser = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/users/${id}/demote`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders() },
      })

      if (!res.ok) throw new Error('Failed to demote')

      fetchEmployees()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const deactivateUser = async (id: string) => {
    const confirmAction = window.confirm(
      'Are you sure you want to deactivate this employee?'
    )

    if (!confirmAction) return

    try {
      const res = await fetch(`${API_URL}/users/${id}/deactivate`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders() },
      })

      if (!res.ok) throw new Error('Failed to deactivate')

      fetchEmployees()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const activateUser = async (id: string) => {
    const confirmAction = window.confirm(
      'Are you sure you want to activate this employee?'
    )

    if (!confirmAction) return

    try {
      const res = await fetch(`${API_URL}/users/${id}/activate`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders() },
      })

      if (!res.ok) throw new Error('Failed to activate')

      fetchEmployees()
    } catch (err: any) {
      alert(err.message)
    }
  }

 const filteredEmployees = employees.filter((emp) => {
  const searchTerm = search.toLowerCase()

  const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
  const email = emp.email.toLowerCase()

  const skillMatch =
    emp.skills?.some((s) =>
      s.skill.name.toLowerCase().includes(searchTerm)
    ) || false

  return (
    fullName.includes(searchTerm) ||
    email.includes(searchTerm) ||
    skillMatch
  )
})


  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 600,
              marginBottom: 4,
              color: '#1a1a1a',
            }}
          >
            Employees
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Manage all employees in your organization
          </p>
        </div>

        <button
          onClick={() => {
            setEditingEmployee(null)
            setShowForm(true)
          }}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          + Add Employee
        </button>
      </div>

      {/* Search */}
      <input
        placeholder="Search by name, skill or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginBottom: 16,
          padding: '8px 12px',
          width: 300,
          borderRadius: 8,
          border: '1px solid #ddd',
        }}
      />

      {/* Content */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e5e5',
          overflow: 'hidden',
          padding: '16px',
        }}
      >
        {loading && <p>Loading employees...</p>}

        {error && (
          <div
            style={{
              padding: '12px',
              background: '#fff5f5',
              color: '#dc2626',
              borderRadius: '8px',
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <EmployeeTable
            employees={filteredEmployees}
            onPromote={promoteUser}
            onDemote={demoteUser}
            onDeactivate={deactivateUser}
            onActivate={activateUser}
            onEdit={(emp) => {
              setEditingEmployee(emp)
              setShowForm(true)
            }}
          />
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <EmployeeForm
            employee={editingEmployee || undefined}
            skills={skills}
            refreshSkills={fetchSkills} 
            onClose={() => {
              setShowForm(false)
              setEditingEmployee(null)
            }}
            onSuccess={() => {
              setShowForm(false)
              setEditingEmployee(null)
              fetchEmployees()
            }}
          />
        </div>
      )}
    </div>
  )
}

export default EmployeesPage
