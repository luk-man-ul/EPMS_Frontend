import { useState, useEffect } from 'react'
import api from '../../../../utils/api'

interface EmployeeRow {
  id: string
  name: string
  department: string
  tasksCompleted: number
  totalAssignedTasks: number
  projectsInvolved: number
  completionRate: number  // % of assigned tasks completed
}

const EmployeeProductivityReport = () => {
  const [employees, setEmployees] = useState<EmployeeRow[]>([])
  const [filtered, setFiltered] = useState<EmployeeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [departments, setDepartments] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch users, tasks, and projects in parallel
        const [usersRes, tasksRes, projectsRes] = await Promise.all([
          api.get('/users'),
          api.get('/tasks', { params: { limit: 1000, page: 1 } }),
          api.get('/projects'),
        ])

        const users: any[] = usersRes.data || []
        const allTasks: any[] = tasksRes.data.data || tasksRes.data || []
        const allProjects: any[] = projectsRes.data.data || projectsRes.data || []

        // Build project membership map: userId → Set of projectIds
        const userProjects: Record<string, Set<string>> = {}
        allProjects.forEach((p: any) => {
          p.members?.forEach((m: any) => {
            const uid = m.userId || m.user?.id
            if (!uid) return
            if (!userProjects[uid]) userProjects[uid] = new Set()
            userProjects[uid].add(p.id)
          })
        })

        // Build task stats per user
        const taskStats: Record<string, { completed: number; total: number }> = {}
        allTasks.forEach((t: any) => {
          const uid = t.assignedToId || t.assignee?.id
          if (!uid) return
          // Only count ASSIGNED and SELF_WORK tasks that are not PROPOSED/REJECTED/CANCELLED
          if (['PROPOSED', 'REJECTED', 'CANCELLED'].includes(t.status)) return
          if (!taskStats[uid]) taskStats[uid] = { completed: 0, total: 0 }
          taskStats[uid].total++
          if (t.status === 'COMPLETED') taskStats[uid].completed++
        })

        // Map employees — only include ACTIVE non-admin users
        const rows: EmployeeRow[] = users
          .filter((u: any) => {
            const roleNames = u.roles?.map((r: any) => r.role?.name || r.name) || []
            return u.status === 'ACTIVE' && !roleNames.includes('ADMIN')
          })
          .map((u: any) => {
            const stats = taskStats[u.id] || { completed: 0, total: 0 }
            const projects = userProjects[u.id]?.size ?? 0
            const completionRate = stats.total > 0
              ? Math.round((stats.completed / stats.total) * 100)
              : 0
            return {
              id: u.id,
              name: `${u.firstName} ${u.lastName}`,
              department: u.department || '—',
              tasksCompleted: stats.completed,
              totalAssignedTasks: stats.total,
              projectsInvolved: projects,
              completionRate,
            }
          })
          // Sort by tasks completed descending
          .sort((a, b) => b.tasksCompleted - a.tasksCompleted)

        // Extract unique departments for filter dropdown
        const depts = [...new Set(
          rows.map(r => r.department).filter(d => d !== '—')
        )].sort()

        setEmployees(rows)
        setFiltered(rows)
        setDepartments(depts)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load productivity data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Apply filters
  useEffect(() => {
    let result = employees
    if (deptFilter) {
      result = result.filter(e => e.department === deptFilter)
    }
    if (searchFilter.trim()) {
      const lower = searchFilter.toLowerCase()
      result = result.filter(e => e.name.toLowerCase().includes(lower))
    }
    setFiltered(result)
  }, [deptFilter, searchFilter, employees])

  // ── Summary stats from filtered list ──────────────────────────────────────
  const totalTasksCompleted = filtered.reduce((s, e) => s + e.tasksCompleted, 0)
  const totalAssigned = filtered.reduce((s, e) => s + e.totalAssignedTasks, 0)
  const avgCompletionRate = filtered.length > 0
    ? Math.round(filtered.reduce((s, e) => s + e.completionRate, 0) / filtered.length)
    : 0

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
        Loading productivity data...
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
        <input
          type="text"
          placeholder="Search employee name..."
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
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
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
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {(searchFilter || deptFilter) && (
          <button
            onClick={() => { setSearchFilter(''); setDeptFilter('') }}
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

      {/* ── Summary Cards ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Total Tasks Completed</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a' }}>{totalTasksCompleted}</div>
          {totalAssigned > 0 && (
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
              out of {totalAssigned} assigned
            </div>
          )}
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Total Employees</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a' }}>{filtered.length}</div>
        </div>
        <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Avg Completion Rate</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#fff' }}>{avgCompletionRate}%</div>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            No employees found
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e5e5', background: '#fafafa' }}>
                {['Employee', 'Department', 'Tasks Completed', 'Total Assigned', 'Completion Rate', 'Projects'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr
                  key={emp.id}
                  style={{ borderBottom: '1px solid #f5f5f5' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>{emp.name}</div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#6b7280' }}>
                    {emp.department}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                    {emp.tasksCompleted}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#6b7280' }}>
                    {emp.totalAssignedTasks}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                        <div style={{
                          height: '100%',
                          width: `${emp.completionRate}%`,
                          background: emp.completionRate >= 80 ? '#1a1a1a' : emp.completionRate >= 50 ? '#d97706' : '#dc2626',
                          borderRadius: '3px',
                        }} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', minWidth: '36px' }}>
                        {emp.completionRate}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#6b7280' }}>
                    {emp.projectsInvolved}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default EmployeeProductivityReport
