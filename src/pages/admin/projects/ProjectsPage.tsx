import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProjectTable from './components/ProjectTable'
import api from '../../../utils/api'
import type {
  ProjectListItem,
  ProjectDetail,
} from './types/project.types'
import ProjectForm from './form/ProjectForm'
import ProjectStatus from './components/ProjectStatus'

interface EmployeeOption {
  id: string
  name: string
  role?: string
}

const ProjectsPage = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] =
    useState<ProjectDetail | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Active filter state
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED'>('ALL')
  
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
    return project.status === activeFilter
  })

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '12px' : '24px',
          marginBottom: isMobile ? '16px' : '28px',
        }}
      >
        <div>
          <h1 style={{ fontSize: isMobile ? '22px' : '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
            Projects
          </h1>
          <p style={{ color: '#6b7280', fontSize: '13px' }}>
            Manage all projects and track progress
          </p>
        </div>

        <button
          onClick={handleCreate}
          style={{
            padding: isMobile ? '8px 16px' : '10px 20px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#111827',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'all 0.2s',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => { if (!isMobile) e.currentTarget.style.backgroundColor = '#374151'; }}
          onMouseLeave={(e) => { if (!isMobile) e.currentTarget.style.backgroundColor = '#111827'; }}
        >
          + Create Project
        </button>
      </div>

      {/* Interactive Stats Cards */}
      {!loading && !error && (
        <>
          {isMobile && (
            <style>{`
              .projects-stats-container::-webkit-scrollbar {
                display: none;
              }
              .projects-stats-container {
                scrollbar-width: none;
                -ms-overflow-style: none;
              }
            `}</style>
          )}
          <div 
            className={isMobile ? "projects-stats-container" : undefined}
            style={isMobile ? {
              display: 'flex',
              overflowX: 'auto',
              gap: '12px',
              paddingBottom: '10px',
              marginBottom: '20px',
              width: '100%',
              WebkitOverflowScrolling: 'touch',
            } : {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}
          >
            {[
              { id: 'ALL' as const,       label: 'Total Projects',  value: projects.length,                                          color: '#111827' },
              { id: 'PLANNING' as const,  label: 'Planning',        value: projects.filter(p => p.status === 'PLANNING').length,     color: '#3730a3' },
              { id: 'ACTIVE' as const,    label: 'Active Projects', value: projects.filter(p => p.status === 'ACTIVE').length,       color: '#92400e' },
              { id: 'ON_HOLD' as const,   label: 'On Hold',         value: projects.filter(p => p.status === 'ON_HOLD').length,      color: '#3a0303' },
              { id: 'COMPLETED' as const, label: 'Completed',       value: projects.filter(p => p.status === 'COMPLETED').length,    color: '#166534' },
              { id: 'ARCHIVED' as const,  label: 'Archived',        value: projects.filter(p => p.status === 'ARCHIVED').length,     color: '#046023' },
            ].map((card) => {
              const isSelected = activeFilter === card.id
              return (
                <div
                  key={card.id}
                  onClick={() => setActiveFilter(card.id)}
                  style={isMobile ? {
                    background: '#fff',
                    borderRadius: '12px',
                    border: isSelected ? `2px solid ${card.color}` : '1px solid #e5e7eb',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    flex: '0 0 130px',
                    boxShadow: isSelected ? `0 2px 6px ${card.color}15` : '0 1px 2px rgba(0,0,0,0.03)',
                    position: 'relative',
                  } : {
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
                    if (isMobile || isSelected) return;
                    e.currentTarget.style.borderColor = card.color
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    if (isMobile || isSelected) return;
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  <p style={{ fontSize: isMobile ? '10px' : '11px', color: '#6b7280', margin: isMobile ? '0 0 8px 0' : '0 0 12px 0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {card.label}
                  </p>
                  <p style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: 800, color: card.color, margin: 0, lineHeight: 1 }}>
                    {card.value}
                  </p>
                  {isSelected && (
                    <div style={{ position: 'absolute', top: isMobile ? 8 : 12, right: isMobile ? 8 : 12, width: isMobile ? 6 : 8, height: isMobile ? 6 : 8, borderRadius: '50%', background: card.color }} />
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Content */}
      <div
        style={isMobile ? undefined : {
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
        ) : isMobile ? (
          // Mobile Card List
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredProjects.map((project) => {
              const teamSize = project.teamSize ?? 0
              const leadName = project.lead ? `${project.lead.firstName} ${project.lead.lastName}` : '—'
              const progress = project.progress ?? 0
              const deadline = project.endDate
                ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—'
              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/admin/projects/${project.id}`)}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                        {project.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        Lead: {leadName}
                      </div>
                    </div>
                    <ProjectStatus status={project.status} />
                  </div>

                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Team:</span>
                      <span style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500 }}>
                        {teamSize} members
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Deadline:</span>
                      <span style={{ fontSize: '12px', color: '#4b5563', fontWeight: 500 }}>{deadline}</span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Progress:</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>{progress}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden', width: '100%' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? '#16a34a' : '#2563eb', borderRadius: '3px' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '10px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(project.id); }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        background: '#fff',
                        color: '#374151',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #fee2e2',
                        background: '#fff',
                        color: '#dc2626',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
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