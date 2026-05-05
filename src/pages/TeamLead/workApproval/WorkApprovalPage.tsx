import { useState, useEffect, useMemo } from 'react'
import api, { getSelfWorkMetrics, approveSelfWork, rejectSelfWork } from '../../../utils/api'
import type { SelfWorkMetrics } from '../../../types/task'
import { Button, Card, Select, LoadingSpinner, Modal, Input } from '../../../components/ui'
import { useToast } from '../../../context/ToastContext'
import StatsCards from './components/StatsCards'

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  PROPOSED: { color: '#92400e', bg: '#fef3c7', label: 'Pending' },
  TODO:      { color: '#065f46', bg: '#d1fae5', label: 'Approved' },
  IN_PROGRESS: { color: '#065f46', bg: '#d1fae5', label: 'Approved' },
  REVIEW:    { color: '#065f46', bg: '#d1fae5', label: 'Approved' },
  COMPLETED: { color: '#065f46', bg: '#d1fae5', label: 'Approved' },
  REJECTED:  { color: '#991b1b', bg: '#fee2e2', label: 'Rejected' },
  CANCELLED: { color: '#6b7280', bg: '#f3f4f6', label: 'Cancelled' },
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const WorkApprovalPage = () => {
  const { showToast } = useToast()

  const [tasks, setTasks] = useState<any[]>([])
  const [metrics, setMetrics] = useState<SelfWorkMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 })
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchData()
  }, [statusFilter, page])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params: any = { type: 'SELF_WORK', page, limit: 10 }
      if (statusFilter) params.status = statusFilter

      const [tasksRes, metricsData] = await Promise.all([
        api.get('/tasks', { params }),
        getSelfWorkMetrics(),
      ])

      setTasks(tasksRes.data.data || tasksRes.data || [])
      const p = tasksRes.data.pagination
      if (p) {
        setPagination({ total: p.total, page: p.page, limit: p.limit, totalPages: p.totalPages })
      }
      setMetrics(metricsData)
    } catch (err: any) {
      console.error('Error fetching work approvals:', err)
      showToast('error', err.response?.data?.message || 'Failed to load work approvals')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (taskId: string) => {
    try {
      setActionLoading(taskId)
      await approveSelfWork(taskId)
      showToast('success', 'Self-work task approved successfully')
      // If this was the last item on the current page, go back to page 1
      if (tasks.length === 1 && page > 1) setPage(1)
      else await fetchData()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to approve task')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectClick = (taskId: string) => {
    setShowRejectModal(taskId)
    setRejectReason('')
  }

  const handleRejectConfirm = async () => {
    if (!showRejectModal) return
    if (!rejectReason.trim()) {
      showToast('error', 'Please provide a rejection reason')
      return
    }
    try {
      setActionLoading(showRejectModal)
      await rejectSelfWork(showRejectModal, rejectReason)
      showToast('success', 'Self-work task rejected')
      setShowRejectModal(null)
      setRejectReason('')
      // If this was the last item on the current page, go back to page 1
      if (tasks.length === 1 && page > 1) setPage(1)
      else await fetchData()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to reject task')
    } finally {
      setActionLoading(null)
    }
  }

  const stats = useMemo(() => {
    if (!metrics) return { totalPending: 0, totalApproved: 0, totalRejected: 0, avgProcessingTime: '0 hrs' }
    return {
      totalPending: metrics.pendingCount,
      totalApproved: metrics.totalApproved,
      totalRejected: metrics.totalRejected,
      avgProcessingTime: `${Math.round(metrics.avgApprovalTimeHours)} hrs`,
    }
  }, [metrics])

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>
          Self-Work Approval
        </h1>
        <p style={{ fontSize: '14px', color: '#666666' }}>
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
      <Card padding="md">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(value) => { setStatusFilter(value as string); setPage(1) }}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'PROPOSED', label: 'Pending' },
              { value: 'TODO', label: 'Approved' },
              { value: 'REJECTED', label: 'Rejected' },
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        {loading ? (
          <div style={{ padding: '48px' }}>
            <LoadingSpinner text="Loading work approvals..." />
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            No work submissions found
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                {['Employee', 'Project', 'Work Title', 'Status', 'Submitted', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const s = statusConfig[task.status] || statusConfig.PROPOSED;
                const isPending = task.status === 'PROPOSED';
                return (
                  <tr key={task.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1f2937' }}>
                      <div style={{ fontWeight: 500 }}>
                        {task.assignee?.firstName} {task.assignee?.lastName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {task.assignee?.email}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#6b7280' }}>
                      {task.project?.name || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1f2937', maxWidth: '200px' }}>
                      {task.title}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: s.color, background: s.bg }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {formatDate(task.createdAt)}
                    </td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      {isPending ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(task.id)}
                            loading={actionLoading === task.id}
                            disabled={actionLoading === task.id}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectClick(task.id)}
                            disabled={actionLoading === task.id}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                          {task.approvedBy
                            ? `By ${task.approvedBy.firstName} ${task.approvedBy.lastName}`
                            : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span style={{ padding: '8px 16px', fontSize: '14px', color: '#374151' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={!!showRejectModal}
        onClose={() => { setShowRejectModal(null); setRejectReason(''); }}
        title="Reject Self-Work Task"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => { setShowRejectModal(null); setRejectReason(''); }}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectConfirm}
              loading={actionLoading !== null}
              disabled={actionLoading !== null || !rejectReason.trim()}
            >
              Reject
            </Button>
          </div>
        }
      >
        <Input
          type="textarea"
          label="Rejection Reason"
          value={rejectReason}
          onChange={(value) => setRejectReason(value)}
          placeholder="Please provide a reason for rejection..."
          rows={4}
        />
      </Modal>
    </div>
  )
}

export default WorkApprovalPage
