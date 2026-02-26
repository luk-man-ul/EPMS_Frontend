import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../../../utils/api'

import ProjectSummary from './components/ProjectSummary'
import TeamMembersPanel from './components/TeamMembersPanel'
import ProjectTasksTab from './components/ProjectTasksTab'
import ProjectTicketsTab from './components/ProjectTicketsTab'
import ProjectFinanceTab from './components/ProjectFinanceTab'

type TabType = 'summary' | 'team' | 'tasks' | 'tickets' | 'finance'

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('summary')

  ////////////////////////////////////////////////////////////
  // FETCH PROJECT
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`)
        setProject(res.data)
      } catch (err) {
        console.error('Failed to load project', err)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) fetchProject()
  }, [projectId])

  if (loading) return <div>Loading project...</div>
  if (!project) return <div>Project not found</div>

  const tabs = [
    { id: 'summary' as TabType, label: 'Summary' },
    { id: 'team' as TabType, label: 'Team Members' },
    { id: 'tasks' as TabType, label: 'Tasks' },
    { id: 'tickets' as TabType, label: 'Tickets' },
    { id: 'finance' as TabType, label: 'Finance' }
  ]

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
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

          <h1 style={{ fontSize: '24px', fontWeight: 600 }}>
            {project.name}
          </h1>
        </div>

        <p style={{ color: '#666', fontSize: '14px', marginLeft: '44px' }}>
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
      {activeTab === 'team' && <TeamMembersPanel project={project} />}
      {activeTab === 'tasks' && <ProjectTasksTab project={project} />}
      {activeTab === 'tickets' && <ProjectTicketsTab project={project} />}
      {activeTab === 'finance' && <ProjectFinanceTab project={project} />}
    </div>
  )
}

export default ProjectDetailPage