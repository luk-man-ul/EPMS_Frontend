import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../../../utils/api'
import { Button, Card, LoadingSpinner, ErrorMessage } from '../../../../components/ui'

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
      <Card>
        <LoadingSpinner text="Loading project..." />
      </Card>
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
        <Button 
          variant="secondary"
          onClick={() => navigate(-1)}
          style={{ marginBottom: '20px' }}
        >
          ← Back
        </Button>
        
        <ErrorMessage 
          type="page"
          message={error}
          title="Error Loading Project"
        />
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
        <Button 
          variant="secondary"
          onClick={() => navigate(-1)}
          style={{ marginBottom: '20px' }}
        >
          ← Back
        </Button>
        
        <ErrorMessage 
          type="page"
          message="The project you're looking for doesn't exist or you don't have access to it."
          title="Project Not Found"
        />
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
      <Button 
        variant="secondary"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '20px' }}
      >
        ← Back
      </Button>

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
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.key as any)}
          >
            {tab.label}
          </Button>
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