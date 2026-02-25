import { useState, useEffect } from 'react'
import api from '../../../utils/api'
import ProjectCard from './components/ProjectCard'

const ProjectsPage = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'at-risk'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const mapStatus = (backendStatus: string) => {
    if (backendStatus === 'COMPLETED') return 'completed'
    if (backendStatus === 'IN_PROGRESS') return 'active'
    if (backendStatus === 'PLANNING') return 'active'
    if (backendStatus === 'ON_HOLD') return 'at-risk'
    return 'active'
  }

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects')
      const mapped = res.data.data.map((p: any) => ({
        ...p,
        status: mapStatus(p.status),
      }))
      setProjects(mapped)
    } catch (err) {
      console.error('Failed to fetch projects', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects =
    filter === 'all'
      ? projects
      : projects.filter((p) => p.status === filter)

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    atRisk: projects.filter((p) => p.status === 'at-risk').length,
  }

  if (loading) return <div>Loading projects...</div>

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700 }}>My Projects</h1>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Manage and track all projects assigned to you
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <StatCard label="Total Projects" value={stats.total} />
        <StatCard label="Active Projects" value={stats.active} color="#10b981" />
        <StatCard label="Completed" value={stats.completed} color="#6366f1" />
        <StatCard label="At Risk" value={stats.atRisk} color="#ef4444" />
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #e5e5e5',
      }}>
        {[
          { label: 'All Projects', value: 'all' as const },
          { label: 'Active', value: 'active' as const },
          { label: 'Completed', value: 'completed' as const },
          { label: 'At Risk', value: 'at-risk' as const },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom:
                filter === tab.value
                  ? '2px solid #1a1a1a'
                  : '2px solid transparent',
              fontWeight: filter === tab.value ? 600 : 500,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px',
      }}>
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          No projects found
        </div>
      )}
    </div>
  )
}

const StatCard = ({
  label,
  value,
  color = '#1a1a1a',
}: {
  label: string
  value: number
  color?: string
}) => (
  <div style={{
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e5e5e5',
  }}>
    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
      {label}
    </div>
    <div style={{ fontSize: '32px', fontWeight: 600, color }}>
      {value}
    </div>
  </div>
)

export default ProjectsPage