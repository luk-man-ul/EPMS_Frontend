import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../utils/api'
import SearchBar from '../../../components/shared/SearchBar'
import FilterComponent from '../../../components/shared/FilterComponent'
import { ProjectStatus, getEnumOptions } from '../../../types/enums'

const MyProjectsPage = () => {
  const navigate = useNavigate()

  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'at-risk'>('all')
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  ////////////////////////////////////////////////////////////////
  // FETCH PROJECTS FROM BACKEND
  ////////////////////////////////////////////////////////////////

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects')

        const mapped = res.data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          progress: p.progress ?? 0,
          deadline: p.endDate,
          teamMembersCount: p.teamSize ?? 0,
          openTasks: p.progress < 100 ? 1 : 0, // temporary until tasks wired
          backendStatus: p.status, // Store backend enum status
          status: (() => {
  switch (p.status) {
    case 'COMPLETED':
      return 'completed'
    case 'PLANNING':
      return 'active'
    case 'ACTIVE':
      return 'active'
    case 'ON_HOLD':
      return 'ON-HOLD'
    case 'CANCELLED':
      return 'CANCELLED'
    case 'ARCHIVED':
      return 'completed'
    default:
      return 'active'
  }
})(),
        }))

        setProjects(mapped)
      } catch (err) {
        console.error('Failed to fetch projects', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  ////////////////////////////////////////////////////////////////
  // FILTER + STATS
  ////////////////////////////////////////////////////////////////

  // Apply search and status filter
  const filteredProjects = projects.filter((p) => {
    // Search filter: check name or description
    const matchesSearch = searchTerm === '' || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Status filter: check backend status enum
    const matchesStatus = statusFilter === null || p.backendStatus === statusFilter
    
    // Tab filter: check computed status
    const matchesTab = filter === 'all' || p.status === filter
    
    return matchesSearch && matchesStatus && matchesTab
  })

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    atRisk: projects.filter((p) => p.status === 'at-risk').length,
  }

  ////////////////////////////////////////////////////////////////

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', color: '#10b981', bg: '#d1fae5' }
      case 'completed':
        return { label: 'Completed', color: '#6366f1', bg: '#e0e7ff' }
      case 'at-risk':
        return { label: 'At Risk', color: '#ef4444', bg: '#fee2e2' }
      default:
        return { label: status, color: '#666666', bg: '#f5f5f5' }
    }
  }

  const getDaysRemaining = (deadline: string) => {
    if (!deadline) return 0
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  ////////////////////////////////////////////////////////////////

  if (loading) return <div>Loading projects...</div>

  ////////////////////////////////////////////////////////////////

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700 }}>
          My Projects
        </h1>
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

      {/* Search and Filter */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        alignItems: 'flex-end',
      }}>
        <SearchBar
          placeholder="Search projects by name or description..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <FilterComponent
          label="Status"
          options={getEnumOptions(ProjectStatus)}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #e5e5e5',
      }}>
        {['all', 'active', 'completed', 'at-risk'].map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value as any)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: filter === value ? '2px solid #000' : '2px solid transparent',
              fontWeight: filter === value ? 600 : 500,
              cursor: 'pointer',
            }}
          >
            {value === 'all'
              ? 'All Projects'
              : value.charAt(0).toUpperCase() + value.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px',
      }}>
        {filteredProjects.map((project) => {
          const statusConfig = getStatusConfig(project.status)
          const daysRemaining = getDaysRemaining(project.deadline)

          return (
            <div
              key={project.id}
              onClick={() => navigate(`/app/projects/${project.id}`)}
              style={{
                background: '#fff',
                border: '1px solid #e5e5e5',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>{project.name}</h3>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: statusConfig.color,
                  background: statusConfig.bg,
                }}>
                  {statusConfig.label}
                </span>
              </div>

              <p style={{ fontSize: '13px', color: '#666' }}>
                {project.description.substring(0, 100)}...
              </p>

              {/* Progress */}
              <div style={{ margin: '12px 0' }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                  {project.progress}%
                </div>
                <div style={{
                  height: '8px',
                  background: '#f5f5f5',
                  borderRadius: '4px',
                }}>
                  <div style={{
                    width: `${project.progress}%`,
                    height: '100%',
                    background: '#10b981',
                  }} />
                </div>
              </div>

              {/* Footer */}
              <div style={{ fontSize: '12px', color: '#666' }}>
                Deadline: {project.deadline
                  ? new Date(project.deadline).toLocaleDateString()
                  : 'N/A'}
                {' • '}
                {daysRemaining} days left
              </div>
            </div>
          )
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          No projects found
        </div>
      )}
    </div>
  )
}

//////////////////////////////////////////////////////////////
// SMALL REUSABLE STAT CARD
//////////////////////////////////////////////////////////////

const StatCard = ({ label, value, color }: any) => (
  <div style={{
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e5e5e5',
  }}>
    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
      {label}
    </div>
    <div style={{
      fontSize: '32px',
      fontWeight: 600,
      color: color || '#1a1a1a',
    }}>
      {value}
    </div>
  </div>
)

export default MyProjectsPage