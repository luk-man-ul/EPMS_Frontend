import { useState, useEffect } from 'react'
import api from '../../../../utils/api'

interface ProjectRow {
  id: string
  name: string
  status: string
  progress: number
  tasksCompleted: number
  totalTasks: number
  teamSize: number
}

const statusStyle: Record<string, { bg: string; color: string }> = {
  ACTIVE:    { bg: '#f0fdf4', color: '#16a34a' },
  PLANNING:  { bg: '#eff6ff', color: '#2563eb' },
  ON_HOLD:   { bg: '#fefce8', color: '#ca8a04' },
  COMPLETED: { bg: '#1a1a1a', color: '#ffffff' },
  ARCHIVED:  { bg: '#f3f4f6', color: '#6b7280' },
}

const formatStatus = (s: string) =>
  s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' ')

const ProjectPerformanceReport = () => {
  const [allProjects, setAllProjects] = useState<ProjectRow[]>([])
  const [filtered, setFiltered] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Filter state
  const [statusFilter, setStatusFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch all projects
        const projectsRes = await api.get('/projects')
        const rawProjects = projectsRes.data.data || projectsRes.data || []

        // Fetch all tasks in one call (limit high enough to get all)
        const tasksRes = await api.get('/tasks', { params: { limit: 1000, page: 1 } })
        const allTasks: any[] = tasksRes.data.data || tasksRes.data || []

        // Group tasks by projectId
        const tasksByProject: Record<string, { total: number; completed: number }> = {}
        allTasks.forEach((t: any) => {
          if (!t.projectId) return
          if (!tasksByProject[t.projectId]) tasksByProject[t.projectId] = { total: 0, completed: 0 }
          // Exclude PROPOSED/REJECTED/CANCELLED from task counts (same logic as backend)
          if (!['PROPOSED', 'REJECTED', 'CANCELLED'].includes(t.status)) {
            tasksByProject[t.projectId].total++
            if (t.status === 'COMPLETED') tasksByProject[t.projectId].completed++
          }
        })

        const mapped: ProjectRow[] = rawProjects.map((p: any) => {
          const tc = tasksByProject[p.id] || { total: 0, completed: 0 }
          return {
            id: p.id,
            name: p.name,
            status: p.status,
            progress: p.progress ?? 0,
            tasksCompleted: tc.completed,
            totalTasks: tc.total,
            teamSize: p.teamSize ?? p.members?.length ?? 0,
          }
        })

        setAllProjects(mapped)
        setFiltered(mapped)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Apply filters whenever filter state or allProjects changes
  useEffect(() => {
    let result = allProjects
    if (statusFilter) {
      result = result.filter(p => p.status === statusFilter)
    }
    if (searchFilter.trim()) {
      const lower = searchFilter.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(lower))
    }
    setFiltered(result)
  }, [statusFilter, searchFilter, allProjects])

  // ── Derived summary stats (always from filtered list) ─────────────────────
  const totalProjects = filtered.length
  const activeProjects = filtered.filter(p => p.status === 'ACTIVE').length
  const completedProjects = filtered.filter(p => p.status === 'COMPLETED').length
  const avgProgress = totalProjects > 0
    ? Math.round(filtered.reduce((s, p) => s + p.progress, 0) / totalProjects)
    : 0

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
        Loading project data...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '24px', background: '#fef2f2', borderRadius: '12px', color: '#dc2626', fontSize: '14px' }}>
        {error}
      </div>
    )
  }

  return (
    <div>
      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* Search by name */}
        <input
          type="text"
          placeholder="Search project name..."
          value={searchFilter}
          onChange={e => setSearchFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #e5e5e5',
            fontSize: '14px',
            outline: 'none',
            minWidth: '200px',
          }}
        />

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #e5e5e5',
            background: '#fff',
            fontSize: '14px',
            color: '#1a1a1a',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PLANNING">Planning</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        {/* Clear */}
        {(statusFilter || searchFilter) && (
          <button
            onClick={() => { setStatusFilter(''); setSearchFilter('') }}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              background: '#fff',
              fontSize: '13px',
              color: '#6b7280',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Summary Cards (4 cards) ────────────────────────────────────────── */}
      {isMobile && (
        <style>{`
          .project-perf-stats-container::-webkit-scrollbar {
            display: none;
          }
          .project-perf-stats-container {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        `}</style>
      )}
      <div 
        className={isMobile ? "project-perf-stats-container" : undefined}
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
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Total Projects */}
        <div style={isMobile ? {
          background: '#fff', 
          border: '1px solid #e5e5e5', 
          borderRadius: '12px', 
          padding: '12px 14px',
          flex: '0 0 130px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        } : {
          background: '#fff', 
          border: '1px solid #e5e5e5', 
          borderRadius: '12px', 
          padding: '20px',
        }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Total Projects</div>
          <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 700, color: '#1a1a1a' }}>{totalProjects}</div>
        </div>

        {/* Avg Progress */}
        <div style={isMobile ? {
          background: '#fff', 
          border: '1px solid #e5e5e5', 
          borderRadius: '12px', 
          padding: '12px 14px',
          flex: '0 0 130px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        } : {
          background: '#fff', 
          border: '1px solid #e5e5e5', 
          borderRadius: '12px', 
          padding: '20px',
        }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Avg Progress</div>
          <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 700, color: '#1a1a1a' }}>{avgProgress}%</div>
        </div>

        {/* Active Projects */}
        <div style={isMobile ? {
          background: '#f0fdf4', 
          border: '1px solid #bbf7d0', 
          borderRadius: '12px', 
          padding: '12px 14px',
          flex: '0 0 130px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        } : {
          background: '#f0fdf4', 
          border: '1px solid #bbf7d0', 
          borderRadius: '12px', 
          padding: '20px',
        }}>
          <div style={{ fontSize: '13px', color: '#16a34a', marginBottom: '8px', fontWeight: 500 }}>Active Projects</div>
          <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 700, color: '#16a34a' }}>{activeProjects}</div>
        </div>

        {/* Completed Projects */}
        <div style={isMobile ? {
          background: '#1a1a1a', 
          borderRadius: '12px', 
          padding: '12px 14px',
          flex: '0 0 130px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        } : {
          background: '#1a1a1a', 
          borderRadius: '12px', 
          padding: '20px',
        }}>
          <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px', fontWeight: 500 }}>Completed Projects</div>
          <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 700, color: '#fff' }}>{completedProjects}</div>
        </div>
      </div>

      {/* ── Project Table ──────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            No projects found
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e5e5', background: '#fafafa' }}>
                {['Project Name', 'Status', 'Progress', 'Tasks', 'Team Size'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => {
                const ss = statusStyle[project.status] || { bg: '#f3f4f6', color: '#6b7280' }
                return (
                  <tr
                    key={project.id}
                    style={{ borderBottom: '1px solid #f5f5f5' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Project Name */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>
                        {project.name}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: ss.bg,
                        color: ss.color,
                      }}>
                        {formatStatus(project.status)}
                      </span>
                    </td>

                    {/* Progress bar */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden', minWidth: '80px' }}>
                          <div style={{ height: '100%', width: `${project.progress}%`, background: '#1a1a1a', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', minWidth: '36px' }}>
                          {project.progress}%
                        </span>
                      </div>
                    </td>

                    {/* Tasks */}
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                      {project.tasksCompleted}/{project.totalTasks}
                    </td>

                    {/* Team Size */}
                    <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
                      {project.teamSize}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ProjectPerformanceReport
