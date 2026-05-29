import { useEffect, useState } from 'react'
import EmployeeTable from './components/EmployeeTable'
import type { Employee } from './types/employee.types'
import EmployeeForm from './form/EmployeeForm'
import FilterComponent from '../../../components/shared/FilterComponent'
import { UserStatus, getEnumOptions } from '../../../types/enums'
import api from '../../../utils/api'

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [search, setSearch] = useState('')
  const [skills, setSkills] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchEmployees()
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const res = await api.get('/skills')
      setSkills(res.data)
    } catch (err) {
      console.error('Failed to fetch skills')
    }
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/users')
      setEmployees(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const promoteUser = async (id: string) => {
    try {
      await api.patch(`/users/${id}/promote`)
      fetchEmployees()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to promote')
    }
  }

  const demoteUser = async (id: string) => {
    try {
      await api.patch(`/users/${id}/demote`)
      fetchEmployees()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to demote')
    }
  }

  const deactivateUser = async (id: string) => {
    const confirmAction = window.confirm('Are you sure you want to deactivate this employee?')
    if (!confirmAction) return
    try {
      await api.patch(`/users/${id}/deactivate`)
      fetchEmployees()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate')
    }
  }

  const activateUser = async (id: string) => {
    const confirmAction = window.confirm('Are you sure you want to activate this employee?')
    if (!confirmAction) return
    try {
      await api.patch(`/users/${id}/activate`)
      fetchEmployees()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to activate')
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

    const matchesSearch = 
      fullName.includes(searchTerm) ||
      email.includes(searchTerm) ||
      skillMatch

    // Status filter
    const matchesStatus = !statusFilter || emp.status === statusFilter

    // Department filter
    const matchesDepartment = !departmentFilter || emp.department === departmentFilter

    return matchesSearch && matchesStatus && matchesDepartment
  })

  // Get unique departments for filter options
  const departments = Array.from(new Set(employees.map(emp => emp.department).filter(Boolean)))
  const departmentOptions = departments.map(dept => ({ value: dept!, label: dept! }))

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '16px' : '0px',
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
            padding: '12px 18px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            fontWeight: 500,
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          + Add Employee
        </button>
      </div>

      {/* Search and Filters */}
      <div style={isMobile ? { 
        display: 'grid', 
        gridTemplateColumns: '1fr',
        gap: '12px', 
        marginBottom: '16px',
      } : { 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '16px',
        alignItems: 'flex-end'
      }}>
        <div style={{ flex: 1, width: '100%' }}>
          <input
            placeholder="Search by name, skill or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '10px 16px',
              width: '100%',
              borderRadius: '10px',
              border: '1px solid #e5e5e5',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>
        
        <div style={{ minWidth: isMobile ? '0' : '180px', width: '100%' }}>
          <FilterComponent
            label="Status"
            options={getEnumOptions(UserStatus)}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>

        {departmentOptions.length > 0 && (
          <div style={{ minWidth: isMobile ? '0' : '180px', width: '100%' }}>
            <FilterComponent
              label="Department"
              options={departmentOptions}
              value={departmentFilter}
              onChange={setDepartmentFilter}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          backgroundColor: isMobile ? 'transparent' : '#fff',
          borderRadius: '12px',
          border: isMobile ? 'none' : '1px solid #e5e5e5',
          overflow: 'hidden',
          padding: isMobile ? '0px' : '16px',
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
