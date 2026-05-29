import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../../../utils/api'

import ProjectSummary from './components/ProjectSummary'
import ProjectTasksTab from './components/ProjectTasksTab'
import ProjectTicketsTab from './components/ProjectTicketsTab'
import ProjectFinanceTab from './components/ProjectFinanceTab'
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    { id: 'tickets' as TabType, label: 'Tickets' },
    { id: 'finance' as TabType, label: 'Finance' },
  ]

  return (
    <div style={{ width: '100%' }}>
      
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'flex-start',
          gap: isMobile ? '16px' : '12px',
          marginBottom: '8px'
        }}>
          <div>
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

              <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 600, margin: 0 }}>
                {project.name}
              </h1>
            </div>
            <p style={{ color: '#666', fontSize: '13px', marginLeft: '44px', marginTop: '4px', margin: 0 }}>
              Project Dashboard
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
            <button
              onClick={handleEdit}
              style={{
                padding: isMobile ? '8px 12px' : '10px 18px',
                borderRadius: '10px',
                border: '1px solid #e5e5e5',
                backgroundColor: '#fff',
                color: '#1a1a1a',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.2s ease',
                flex: isMobile ? 1 : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isMobile) e.currentTarget.style.backgroundColor = '#f5f5f5'
              }}
              onMouseLeave={(e) => {
                if (!isMobile) e.currentTarget.style.backgroundColor = '#fff'
              }}
            >
              Edit Project
            </button>

            <button
              onClick={handleDelete}
              style={{
                padding: isMobile ? '8px 12px' : '10px 18px',
                borderRadius: '10px',
                border: '1px solid #fecaca',
                backgroundColor: '#fff',
                color: '#dc2626',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.2s ease',
                flex: isMobile ? 1 : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isMobile) e.currentTarget.style.backgroundColor = '#fef2f2'
              }}
              onMouseLeave={(e) => {
                if (!isMobile) e.currentTarget.style.backgroundColor = '#fff'
              }}
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e5e5e5', marginBottom: isMobile ? '20px' : '32px' }}>
        {isMobile && (
          <style>{`
            .project-tabs-container::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        )}
        <div 
          className="project-tabs-container"
          style={{ 
            display: 'flex', 
            gap: isMobile ? '2px' : '4px',
            overflowX: isMobile ? 'auto' : 'visible',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: isMobile ? '4px' : '0px',
            marginBottom: isMobile ? '-4px' : '0px',
          }}
        >
          <div style={{ display: 'flex', gap: isMobile ? '2px' : '4px', width: isMobile ? 'auto' : '100%' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: isMobile ? '10px 12px' : '12px 20px',
                  border: 'none',
                  background: 'none',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: 500,
                  color: activeTab === tab.id ? '#1a1a1a' : '#666',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.id ? '2px solid #1a1a1a' : '2px solid transparent',
                  marginBottom: '-1px',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && <ProjectSummary project={project} />}
      {activeTab === 'tasks' && <ProjectTasksTab project={project} onTaskCreated={fetchProject} />}
      {activeTab === 'tickets' && <ProjectTicketsTab project={project} />}
      {activeTab === 'finance' && <ProjectFinanceTab />}

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