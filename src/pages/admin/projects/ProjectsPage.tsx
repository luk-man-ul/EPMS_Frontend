import { useEffect, useState } from 'react'
import ProjectTable from './components/ProjectTable'
import api from '../../../utils/api'
import type {
  ProjectListItem,
  ProjectDetail,
} from './types/project.types'
import ProjectForm from './form/ProjectForm'
import SearchBar from '../../../components/shared/SearchBar'
import FilterComponent from '../../../components/shared/FilterComponent'
import { ProjectStatus, getEnumOptions } from '../../../types/enums'

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
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  ////////////////////////////////////////////////////////////
  // FETCH PROJECTS
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await api.get('/projects')
      setProjects(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
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
    // Search filter: check if name or description contains search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const nameMatch = project.name.toLowerCase().includes(searchLower)
      const descriptionMatch = project.description?.toLowerCase().includes(searchLower)
      
      if (!nameMatch && !descriptionMatch) {
        return false
      }
    }

    // Status filter: check if project status matches selected filter
    if (statusFilter && project.status !== statusFilter) {
      return false
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

      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <SearchBar
          placeholder="Search projects by name or description..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/* Status Filter */}
      <div style={{ marginBottom: '20px' }}>
        <FilterComponent
          label="Status"
          options={getEnumOptions(ProjectStatus)}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

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