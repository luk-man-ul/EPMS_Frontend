import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../../../utils/api'

import OverviewTab from './components/OverviewTab'
import TeamMembersTab from './components/TeamMembersTab'
import TaskBoardTab from './components/TaskBoardTab'
import TicketsTab from './components/TicketsTab'

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] =
    useState<'overview' | 'members' | 'tasks' | 'tickets'>('overview')

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`)
        setProject(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) fetchProject()
  }, [projectId])

  if (loading) return <div>Loading...</div>
  if (!project) return <div>Project not found</div>

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <h1 style={{ marginTop: 20 }}>{project.name}</h1>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 16, margin: '20px 0' }}>
        {['overview', 'members', 'tasks', 'tickets'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: activeTab === tab ? '2px solid #2563eb' : '1px solid #e5e7eb',
              background: activeTab === tab ? '#eff6ff' : '#fff',
              cursor: 'pointer'
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <OverviewTab project={project} />
      )}

      {activeTab === 'members' && (
        <TeamMembersTab members={project.members} />
      )}

      {activeTab === 'tasks' && (
        <TaskBoardTab tasks={project.tasks} />
      )}

      {activeTab === 'tickets' && (
        <TicketsTab tickets={project.tickets} />
      )}
    </div>
  )
}

export default ProjectDetailPage