import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../../../utils/api'

import ProjectSummary from './components/ProjectSummary'
import ProjectTasksTab from './components/ProjectTasksTab'
import ProjectTicketsTab from './components/ProjectTicketsTab'
import ProjectForm from '../form/ProjectForm'

type TabType = 'summary' | 'tasks' | 'tickets' | 'finance'

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('summary')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  ////////////////////////////////////////////////////////////
  // HANDLE TAB FROM URL QUERY PARAMETER
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['summary', 'tasks', 'tickets'].includes(tabParam)) {
      setActiveTab(tabParam as TabType)
    }
  }, [searchParams])

  ////////////////////////////////////////////////////////////
  // FETCH PROJECT
  ////////////////////////////////////////////////////////////

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`)
      setProject(res.data)
    } catch (err: any) {
      console.error('Failed to load project', err)
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        navigate('/unauthorized')
      } else if (err.response?.status === 404) {
        // Project not found - will be handled by the render check
        setProject(null)
      }
      // 401 is handled by axios interceptor
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadProject = async () => {
      await fetchProject()
    }

    if (projectId) loadProject()
  }, [projectId, navigate])

  if (loading) return <div>Loading project...</div>
  if (!project) return <div>Project not found</div>

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this project? This action cannot be undone.'
    )

    if (!confirmDelete) return

    try {
      await api.delete(`/projects/${projectId}`)
      navigate('/admin/projects')
    } catch (err) {
      console.error('Delete failed', err)
      alert('Failed to delete project')
    }
  }

  const tabs = [
    { id: 'summary' as TabType, label: 'Overview' },
    { id: 'tasks' as TabType, label: 'Tasks' },
    { id: 'tickets' as TabType, label: 'Tickets' }
  ]

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666',
                padding: '4px'
              }}
            >
              ←
            </button>

            <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>
              {project.name}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleEdit}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1px solid #e5e5e5',
                backgroundColor: '#fff',
                color: '#1a1a1a',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff'
              }}
            >
              Edit Project
            </button>

            <button
              onClick={handleDelete}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1px solid #fecaca',
                backgroundColor: '#fff',
                color: '#dc2626',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff'
              }}
            >
              Delete Project
            </button>
          </div>
        </div>

        <p style={{ color: '#666', fontSize: '14px', marginLeft: '44px', margin: 0 }}>
          Project Dashboard
        </p>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e5e5e5', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: 'none',
                fontSize: '14px',
                fontWeight: 500,
                color: activeTab === tab.id ? '#1a1a1a' : '#666',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #1a1a1a' : '2px solid transparent',
                marginBottom: '-1px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && <ProjectSummary project={project} />}
      {activeTab === 'tasks' && <ProjectTasksTab project={project} onTaskCreated={fetchProject} />}
      {activeTab === 'tickets' && <ProjectTicketsTab project={project} />}

      {/* Edit Modal */}
      {isEditModalOpen && (
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
            projectId={projectId}
            initialData={project}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={() => {
              setIsEditModalOpen(false)
              fetchProject()
            }}
          />
        </div>
      )}
    </div>
  )
}

export default ProjectDetailPage