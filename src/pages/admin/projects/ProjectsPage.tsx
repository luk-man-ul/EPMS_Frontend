import { useEffect, useState } from 'react'
import ProjectTable from './components/ProjectTable'
import api from '../../../utils/api'
import type {
  ProjectListItem,
  ProjectDetail,
} from './types/project.types'
import ProjectForm from './form/ProjectForm'

interface EmployeeOption {
  id: string
  name: string
  role?: string
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] =
    useState<ProjectDetail | null>(null)

  // Active filter state
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'RISK'>('ALL')
  
  // Employees (cached for form)
  const [employees, setEmployees] = useState<EmployeeOption[]>([])

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

  const loadEmployees = async () => {
    try {
      const response = await api.get('/users')
      const employeeData = response.data.data || response.data || []
      setEmployees(
        employeeData.map((emp: any) => ({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          role: emp.role,
        }))
      )
    } catch (err) {
      console.error('Failed to load employees:', err)
    }
  }

  const handleCreate = () => {
    setEditingProjectId(null)
    setSelectedProject(null)
    setIsModalOpen(true)
  }

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    try {
      await api.delete(`/projects/${id}`)
      fetchProjects()
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  const handleSuccess = () => {
    setIsModalOpen(false)
    setEditingProjectId(null)
    setSelectedProject(null)
    fetchProjects()
  }

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === 'ALL') return true
    if (activeFilter === 'ACTIVE') return project.status === 'ACTIVE'
    if (activeFilter === 'COMPLETED') return project.status === 'COMPLETED'
    if (activeFilter === 'RISK') return project.status === 'ON_HOLD' || project.status === 'CANCELLED'
    return true
  })

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
            Projects
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Manage all projects and track progress
          </p>
        </div>

        <button
          onClick={handleCreate}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#111827',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111827'}
        >
          + Create Project
        </button>
      </div>

      {/* Interactive Stats Cards */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { id: 'ALL' as const,       label: 'Total Projects',  value: projects.length,                                          color: '#111827' },
            { id: 'ACTIVE' as const,    label: 'Active Projects', value: projects.filter(p => p.status === 'ACTIVE').length,       color: '#16a34a' },
            { id: 'COMPLETED' as const, label: 'Completed',       value: projects.filter(p => p.status === 'COMPLETED').length,    color: '#2563eb' },
            { id: 'RISK' as const,      label: 'At Risk',         value: projects.filter(p => p.status === 'ON_HOLD' || p.status === 'CANCELLED').length, color: '#dc2626' },
          ].map((card) => {
            const isSelected = activeFilter === card.id
            return (
              <div
                key={card.id}
                onClick={() => setActiveFilter(card.id)}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  border: isSelected ? `2px solid ${card.color}` : '1px solid #e5e7eb',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? `0 4px 12px ${card.color}15` : '0 1px 3px rgba(0,0,0,0.04)',
                  position: 'relative',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = card.color
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                  }
                }}
              >
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 12px 0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {card.label}
                </p>
                <p style={{ fontSize: '32px', fontWeight: 800, color: card.color, margin: 0, lineHeight: 1 }}>
                  {card.value}
                </p>
                {isSelected && (
                  <div style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', background: card.color }} />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Content */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading projects...</div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>{error}</div>
        ) : (
          <ProjectTable
            projects={filteredProjects}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
            backdropFilter: 'blur(4px)',
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