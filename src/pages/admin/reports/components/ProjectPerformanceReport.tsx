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
  budget: number | null
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
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        // GET /projects returns all projects for admin with tasks + members included
        const res = await api.get('/projects')
        const raw = res.data.data || res.data || []

        const mapped: ProjectRow[] = raw.map((p: any) => {
          const totalTasks = p.tasks?.length ?? 0
          const completedTasks = p.tasks?.filter((t: any) => t.status === 'COMPLETED').length ?? 0
          return {
            id: p.id,
            name: p.name,
            status: p.status,
            progress: p.progress ?? (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0),
            tasksCompleted: completedTasks,
            totalTasks,
            teamSize: p.teamSize ?? p.members?.length ?? 0,
            budget: p.budget ?? null,
          }
        })

        setProjects(mapped)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // ── Derived summary stats ──────────────────────────────────────────────────
  const totalProjects = projects.length
  const avgProgress = totalProjects > 0
    ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / totalProjects)
    : 0
  const totalBudget = projects.reduce((s, p) => s + (p.budget ?? 0), 0)

  const formatBudget = (n: number) => {
    if (n === 0) return '—'
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
    return `$${n}`
  }

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
      {/* ── Summary Cards (3 only) ─────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/* Total Projects */}
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Total Projects</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a' }}>{totalProjects}</div>
        </div>

        {/* Avg Progress */}
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Avg Progress</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a' }}>{avgProgress}%</div>
        </div>

        {/* Total Budget */}
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Total Budget</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a' }}>{formatBudget(totalBudget)}</div>
        </div>
      </div>

      {/* ── Project Table ──────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'hidden' }}>
        {projects.length === 0 ? (
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
              {projects.map((project) => {
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
