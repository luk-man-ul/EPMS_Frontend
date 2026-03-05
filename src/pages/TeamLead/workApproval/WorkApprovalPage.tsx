import { useState, useEffect, useMemo } from 'react'
import { getPendingApprovals, getSelfWorkMetrics } from '../../../utils/api'
import type { Task } from '../../../types/task'
import type { SelfWorkMetrics } from '../../../types/task'
import StatsCards from './components/StatsCards'
import WorkApprovalFilters from './components/WorkApprovalFilters'
import WorkApprovalTable from './components/WorkApprovalTable'

const WorkApprovalPage = () => {
  const [projectFilter, setProjectFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tasks, setTasks] = useState<Task[]>([])
  const [metrics, setMetrics] = useState<SelfWorkMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from backend
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [tasksData, metricsData] = await Promise.all([
        getPendingApprovals(),
        getSelfWorkMetrics()
      ])
      setTasks(tasksData)
      setMetrics(metricsData)
    } catch (err: any) {
      console.error('Error fetching work approvals:', err)
      setError(err.response?.data?.message || 'Failed to load work approvals')
    } finally {
      setLoading(false)
    }
  }

  // Get unique projects
  const projects = useMemo(() => {
    const uniqueProjects = Array.from(new Set(tasks.map(t => t.project?.name).filter((name): name is string => Boolean(name))))
    return ['all', ...uniqueProjects]
  }, [tasks])

  // Transform tasks to approval format
  const approvals = useMemo(() => {
    return tasks.map(task => ({
      id: task.id,
      employeeName: task.creator ? `${task.creator.firstName} ${task.creator.lastName}` : 'Unknown',
      project: task.project?.name || 'Unknown Project',
      workTitle: task.title,
      submittedDate: task.createdAt.toString(),
      estimatedTime: task.estimatedHrs ? `${task.estimatedHrs} hours` : 'N/A',
      status: (task.status === 'PROPOSED' ? 'pending' : 
              task.status === 'REJECTED' ? 'rejected' : 
              'approved') as 'pending' | 'approved' | 'rejected',
      description: task.description || '',
      reason: '',
      expectedOutcome: '',
      attachment: '',
    }))
  }, [tasks])

  // Filter approvals
  const filteredApprovals = useMemo(() => {
    return approvals.filter(approval => {
      const matchesProject = projectFilter === 'all' || approval.project === projectFilter
      const matchesStatus = statusFilter === 'all' || approval.status === statusFilter
      return matchesProject && matchesStatus
    })
  }, [approvals, projectFilter, statusFilter])

  // Calculate stats from metrics
  const stats = useMemo(() => {
    if (!metrics) {
      return {
        totalPending: 0,
        totalApproved: 0,
        totalRejected: 0,
        avgProcessingTime: '0 hrs',
      }
    }
    
    return {
      totalPending: metrics.pendingCount,
      totalApproved: metrics.totalApproved,
      totalRejected: metrics.totalRejected,
      avgProcessingTime: `${Math.round(metrics.avgApprovalTimeHours)} hrs`,
    }
  }, [metrics])

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}>
          <div style={{
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
              animation: 'spin 1s linear infinite',
            }}>
              ⏳
            </div>
            <div style={{
              fontSize: '16px',
              color: '#666666',
            }}>
              Loading work approvals...
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
          }}>
            ⚠️
          </div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#991b1b',
            marginBottom: '8px',
          }}>
            Error Loading Data
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#7f1d1d',
            marginBottom: '16px',
          }}>
            {error}
          </p>
          <button
            onClick={fetchData}
            style={{
              padding: '10px 20px',
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#1a1a1a',
          marginBottom: '8px',
        }}>
          Self-Work Approval
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#666666',
        }}>
          Review and approve employee-submitted personal work
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalPending={stats.totalPending}
        totalApproved={stats.totalApproved}
        totalRejected={stats.totalRejected}
        avgProcessingTime={stats.avgProcessingTime}
      />

      {/* Filters */}
      <WorkApprovalFilters
        projectFilter={projectFilter}
        statusFilter={statusFilter}
        projects={projects}
        onProjectChange={setProjectFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Table */}
      <WorkApprovalTable approvals={filteredApprovals} onRefresh={fetchData} />
    </div>
  )
}

export default WorkApprovalPage
