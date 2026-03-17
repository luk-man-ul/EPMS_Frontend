import { useEffect, useState } from 'react'
import ProjectTable from './components/ProjectTable'
import ProjectFilters from './components/ProjectFilters'
import api from '../../../utils/api'
import type {
  ProjectListItem,
  ProjectDetail,
} from './types/project.types'
import ProjectForm from './form/ProjectForm'
import SearchBar from '../../../components/shared/SearchBar'

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

const ProjectsPage = () => {
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] =
    useState<ProjectDetail | null>(null)

  // Search state
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filter state
  const [filters, setFilters] = useState<ProjectFilterValues>({})
  
  // Employees for filters
  const [employees, setEmployees] = useState<EmployeeOption[]>([])

  ////////////////////////////////////////////////////////////
  // FETCH PROJECTS
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    fetchProjects()
    loadEmployees()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await api.get('/projects')
      const projectData = response.data.data || response.data || []
      setProjects(projectData)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  ////////////////////////////////////////////////////////////
  // LOAD EMPLOYEES FOR FILTERS
  ////////////////////////////////////////////////////////////

  const loadEmployees = async () => {
    try {
      const response = await api.get('/users')
      const employeeData = response.data.data || response.data || []
      setEmployees(
        employeeData.map((emp: any) => ({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
        }))
      )
    } catch (err) {
      console.error('Failed to load employees:', err)
    }
  }

  ////////////////////////////////////////////////////////////
  // FILTER HANDLER
  ////////////////////////////////////////////////////////////

  const handleFilterChange = (newFilters: any) => {
    if (newFilters.__clear) {
      setFilters({})
      return
    }

    setFilters({ ...filters, ...newFilters })
  }

  ////////////////////////////////////////////////////////////
  // CREATE
  ////////////////////////////////////////////////////////////

  const handleCreate = () => {
    setEditingProjectId(null)
    setSelectedProject(null)
    setIsModalOpen(true)
  }

  ////////////////////////////////////////////////////////////
  // EDIT
  ////////////////////////////////////////////////////////////

  const handleEdit = async (id: string) => {
    try {
      const res = await api.get(`/projects/${id}`)
      setSelectedProject(res.data)
      setEditingProjectId(id)
      setIsModalOpen(true)
    } catch (err) {
      console.error('Failed to load project for edit', err)
    }
  }

  ////////////////////////////////////////////////////////////
  // DELETE
  ////////////////////////////////////////////////////////////

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this project?'
    )

    if (!confirmDelete) return

    try {
      await api.delete(`/projects/${id}`)
      fetchProjects()
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  ////////////////////////////////////////////////////////////
  // SUCCESS HANDLER (CREATE / EDIT)
  ////////////////////////////////////////////////////////////

  const handleSuccess = () => {
    setIsModalOpen(false)
    setEditingProjectId(null)
    setSelectedProject(null)
    fetchProjects()
  }

  ////////////////////////////////////////////////////////////
  // FILTER LOGIC
  ////////////////////////////////////////////////////////////

  const filteredProjects = projects.filter((project) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const nameMatch = project.name.toLowerCase().includes(searchLower)
      const descriptionMatch = project.description?.toLowerCase().includes(searchLower)
      
      if (!nameMatch && !descriptionMatch) {
        return false
      }
    }

    // Status filter
    if (filters.status && project.status !== filters.status) {
      return false
    }

    // Owner/Team Lead filter
    if (filters.ownerId) {
      if (project.lead?.id !== filters.ownerId) {
        return false
      }
    }

    // Member filter
    if (filters.memberId) {
      const hasMember = project.members?.some(
        (member: any) => member.user?.id === filters.memberId
      )
      if (!hasMember) {
        return false
      }
    }

    // Start date filter
    if (filters.startDate && project.startDate) {
      const projectStart = new Date(project.startDate)
      const filterStart = new Date(filters.startDate)
      if (projectStart < filterStart) {
        return false
      }
    }

    // End date filter
    if (filters.endDate && project.endDate) {
      const projectEnd = new Date(project.endDate)
      const filterEnd = new Date(filters.endDate)
      if (projectEnd > filterEnd) {
        return false
      }
    }

    return true
  })

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

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
              letterSpacing: '-0.01em',
            }}
          >
            Projects
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Manage all projects and track progress
          </p>
        </div>

        <button
          onClick={handleCreate}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          + Create Project
        </button>
      </div>

      {/* Stats Cards */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Projects',     value: projects.length,                                          color: '#1a1a1a' },
            { label: 'Active Projects',    value: projects.filter(p => p.status === 'ACTIVE').length,       color: '#16a34a' },
            { label: 'Completed',          value: projects.filter(p => p.status === 'COMPLETED').length,    color: '#2563eb' },
            { label: 'At Risk',            value: projects.filter(p => p.status === 'ON_HOLD' || p.status === 'CANCELLED').length, color: '#dc2626' },
          ].map((card) => (
            <div key={card.label} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e5e5', padding: '20px 24px' }}>
              <p style={{ fontSize: '13px', color: '#888', margin: '0 0 8px 0', fontWeight: 500 }}>{card.label}</p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: card.color, margin: 0, lineHeight: 1 }}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <SearchBar
          placeholder="Search projects by name or description..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/* Comprehensive Filters */}
      <ProjectFilters
        employees={employees}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Content */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e5e5',
          overflow: 'visible',
        }}
      >
        {loading && <div style={{ padding: 20 }}>Loading projects...</div>}
        {error && (
          <div style={{ padding: 20, color: 'red' }}>{error}</div>
        )}

        {!loading && !error && (
          <ProjectTable
            projects={filteredProjects}
          />
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
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
          <ProjectForm
            projectId={editingProjectId}
            initialData={selectedProject}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleSuccess}
          />
        </div>
      )}
    </div>
  )
}

export default ProjectsPage