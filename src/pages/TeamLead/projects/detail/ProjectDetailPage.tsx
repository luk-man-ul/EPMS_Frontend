import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../../../utils/api'

import OverviewTab from './components/OverviewTab'
import TaskBoardTab from './components/TaskBoardTab'
import TicketsTab from './components/TicketsTab'

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] =
    useState<'overview' | 'tasks' | 'tickets'>('overview')

  // Handle tab from URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['overview', 'tasks', 'tickets'].includes(tabParam)) {
      setActiveTab(tabParam as 'overview' | 'tasks' | 'tickets')
    }
  }, [searchParams])

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await api.get(`/projects/${projectId}`)
        setProject(res.data)
      } catch (err: any) {
        console.error(err)
        setError(err.response?.data?.message || 'Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    if (projectId) fetchProject()
  }, [projectId])

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        fontSize: '14px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #e5e5e5',
            borderTop: '3px solid #1a1a1a',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px'
          }} />
          Loading project...
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 16px',
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '20px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fafafa'
            e.currentTarget.style.borderColor = '#d4d4d4'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff'
            e.currentTarget.style.borderColor = '#e5e5e5'
          }}
        >
          ← Back
        </button>
        
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#991b1b', marginBottom: '8px' }}>
            Error Loading Project
          </div>
          <div style={{ fontSize: '14px', color: '#b91c1c' }}>
            {error}
          </div>
        </div>
      </div>
    )
  }

  // Not found state
  if (!project) {
    return (
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 16px',
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '20px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fafafa'
            e.currentTarget.style.borderColor = '#d4d4d4'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff'
            e.currentTarget.style.borderColor = '#e5e5e5'
          }}
        >
          ← Back
        </button>
        
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#92400e', marginBottom: '8px' }}>
            Project Not Found
          </div>
          <div style={{ fontSize: '14px', color: '#b45309' }}>
            The project you're looking for doesn't exist or you don't have access to it.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: 1200, 
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        style={{
          padding: '10px 16px',
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          marginBottom: '20px',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#fafafa'
          e.currentTarget.style.borderColor = '#d4d4d4'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#ffffff'
          e.currentTarget.style.borderColor = '#e5e5e5'
        }}
      >
        ← Back
      </button>

      {/* Project Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 700,
          color: '#1a1a1a',
          marginBottom: '8px',
          letterSpacing: '-0.01em'
        }}>
          {project.name}
        </h1>
        {project.description && (
          <p style={{ 
            fontSize: '14px', 
            color: '#666',
            lineHeight: '1.6'
          }}>
            {project.description}
          </p>
        )}
      </div>

      {/* TABS */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        borderBottom: '1px solid #e5e5e5',
        paddingBottom: '0'
      }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'tasks', label: 'Tasks' },
          { key: 'tickets', label: 'Tickets' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #1a1a1a' : '2px solid transparent',
              fontWeight: activeTab === tab.key ? 600 : 500,
              fontSize: '14px',
              color: activeTab === tab.key ? '#1a1a1a' : '#666',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.color = '#1a1a1a'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.color = '#666'
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '400px' }}>
        {activeTab === 'overview' && (
          <OverviewTab project={project} />
        )}

        {activeTab === 'tasks' && (
          <TaskBoardTab tasks={project.tasks} />
        )}

        {activeTab === 'tickets' && (
          <TicketsTab tickets={project.tickets} />
        )}
      </div>
    </div>
  )
}

export default ProjectDetailPage