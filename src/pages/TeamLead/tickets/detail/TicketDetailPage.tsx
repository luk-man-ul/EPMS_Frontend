import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import api from '../../../../utils/api'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import ConfirmationModal from '../../../../components/shared/ConfirmationModal'
import TicketStatusTimeline from '../../../admin/tickets/detail/components/TicketStatusTimeline'
import { getAllowedTransitions, formatStatus as formatStatusEnum, type TicketStatus } from '../../../../types/ticketWorkflow'

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  BUG:         { icon: '🐛', color: '#dc2626', bg: '#fef2f2' },
  FEATURE:     { icon: '✨', color: '#7c3aed', bg: '#f5f3ff' },
  IMPROVEMENT: { icon: '🔧', color: '#2563eb', bg: '#eff6ff' },
  QUESTION:    { icon: '❓', color: '#d97706', bg: '#fffbeb' },
  SUPPORT:     { icon: '🎧', color: '#0891b2', bg: '#ecfeff' },
}

const priorityConfig: Record<string, { color: string; bg: string }> = {
  LOW:    { color: '#16a34a', bg: '#f0fdf4' },
  MEDIUM: { color: '#2563eb', bg: '#eff6ff' },
  HIGH:   { color: '#d97706', bg: '#fffbeb' },
  URGENT: { color: '#dc2626', bg: '#fef2f2' },
}

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  OPEN:             { color: '#1e40af', bg: '#dbeafe', border: '#bfdbfe' },
  IN_PROGRESS:      { color: '#b45309', bg: '#fef3c7', border: '#fde68a' },
  WAITING_FOR_USER: { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  RESOLVED:         { color: '#065f46', bg: '#d1fae5', border: '#a7f3d0' },
  CLOSED:           { color: '#374151', bg: '#e5e7eb', border: '#d1d5db' },
  REJECTED:         { color: '#991b1b', bg: '#fecaca', border: '#fca5a5' },
  REOPENED:         { color: '#1e40af', bg: '#dbeafe', border: '#bfdbfe' },
}

const TicketDetailPage = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const fromProject = location.state?.fromProject
  const fromProjectRef = useRef(fromProject)

  const handleBack = () => {
    if (fromProjectRef.current) {
      navigate(`/app/projects/${fromProjectRef.current}?tab=tickets`)
    } else {
      navigate('/app/tickets')
    }
  }

  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<'restricted' | 'notfound' | 'failed' | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [selfAssigning, setSelfAssigning] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [resolution, setResolution] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const { showToast } = useToast()

  const fetchTicket = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get(`/tickets/${ticketId}`)
      setTicket(res.data)
    } catch (err: any) {
      if (err.response?.status === 403) setError('restricted')
      else if (err.response?.status === 404) setError('notfound')
      else setError('failed')
    } finally { setLoading(false) }
  }

  useEffect(() => { if (ticketId) fetchTicket() }, [ticketId])

  const handleSelfAssign = async () => {
    try {
      setSelfAssigning(true)
      await api.patch(`/tickets/${ticket.id}/self-assign`)
      showToast('success', 'Ticket assigned to you')
      await fetchTicket()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to self-assign')
    } finally { setSelfAssigning(false) }
  }

  const handleAssign = async (userId: string) => {
    try {
      setAssigning(true)
      await api.patch(`/tickets/${ticket.id}/assign`, { assignedToId: userId || null })
      showToast('success', 'Ticket assigned')
      await fetchTicket()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to assign')
    } finally { setAssigning(false) }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'RESOLVED' && !resolution.trim()) {
      showToast('error', 'Resolution is required when marking as resolved')
      return
    }
    try {
      setUpdatingStatus(true)
      const payload: any = { status: newStatus }
      if (newStatus === 'RESOLVED') payload.resolution = resolution.trim()
      await api.patch(`/tickets/${ticket.id}/status`, payload)
      showToast('success', 'Status updated')
      setResolution('')
      setSelectedStatus('')
      await fetchTicket()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to update status')
    } finally { setUpdatingStatus(false) }
  }

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true)
      await api.delete(`/tickets/${ticket.id}`)
      handleBack()
      showToast('success', 'Ticket deleted')
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to delete')
    } finally { setDeleting(false); setShowDeleteConfirm(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e5e5e5', borderTopColor: '#1a1a1a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: '#666', fontSize: 14 }}>Loading ticket...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error === 'restricted') return (
    <div style={{ padding: 60, textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Access Restricted</h2>
      <p style={{ color: '#666', marginBottom: 28 }}>You don't have permission to view this ticket.</p>
      <button onClick={handleBack} style={{ padding: '10px 24px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>← Go Back</button>
    </div>
  )

  if (error === 'notfound') return (
    <div style={{ padding: 60, textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎫</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Ticket Not Found</h2>
      <button onClick={handleBack} style={{ marginTop: 16, padding: '10px 24px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>← Back</button>
    </div>
  )

  if (error === 'failed') return <div style={{ padding: 40, color: '#dc2626' }}>Failed to load ticket.</div>
  if (!ticket) return null

  const isAdmin = user?.role === 'ADMIN'
  const isLead = user?.role === 'TEAM_LEAD' && ticket.project?.leadId === user?.id
  const isEmployee = user?.role === 'EMPLOYEE'
  const isAssignee = ticket.assignedToId === user?.id
  const isReporter = ticket.reporterId === user?.id
  const isUnassigned = !ticket.assignedToId
  const isProjectMember = ticket.project?.members?.some((m: any) => m.userId === user?.id)
  const canAssign = isAdmin || isLead
  const canSelfAssign = isEmployee && isUnassigned && isProjectMember
  const canUpdateStatus = isAdmin || isLead || (isEmployee && isAssignee)
  const canEditDelete = isReporter

  const allowedTransitions = getAllowedTransitions(
    ticket?.status as TicketStatus || 'OPEN',
    user?.role as 'ADMIN' | 'TEAM_LEAD' | 'EMPLOYEE' || 'EMPLOYEE',
    isLead
  )

  const type = typeConfig[ticket.type] || { icon: '📋', color: '#666', bg: '#f5f5f5' }
  const priority = priorityConfig[ticket.priority] || priorityConfig.MEDIUM
  const status = statusConfig[ticket.status] || statusConfig.OPEN
  const assigneeName = ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : 'Unassigned'
  const reporterName = `${ticket.reporter?.firstName} ${ticket.reporter?.lastName}`

  const avatarInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* TOP BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <button onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #e5e5e5', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 500, color: '#444', cursor: 'pointer' }}>
          ← Back
        </button>
        {canEditDelete && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate(`/app/tickets/${ticket.id}/edit`)} style={{ padding: '8px 16px', background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#1a1a1a', cursor: 'pointer' }}>
              ✏️ Edit
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} style={{ padding: '8px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}>
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {/* HERO CARD */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '28px 32px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: 12, color: '#999', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📁</span><span>{ticket.project?.name}</span><span>›</span><span>Tickets</span>
            </div>
            {/* Type + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 22 }}>{type.icon}</span>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f0f0f', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                {ticket.title}
              </h1>
            </div>
            {/* Ticket ID */}
            <div style={{ fontSize: 11, color: '#bbb', fontFamily: 'monospace', marginTop: 4 }}>
              #{ticket.id?.slice(0, 8).toUpperCase()}
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: type.bg, color: type.color }}>
              {ticket.type}
            </span>
            <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: priority.bg, color: priority.color }}>
              {ticket.priority}
            </span>
            <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
              {ticket.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Description */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Description</div>
            <p style={{ fontSize: 15, color: '#333', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
              {ticket.description || <span style={{ color: '#bbb', fontStyle: 'italic' }}>No description provided.</span>}
            </p>
          </div>

          {/* Resolution */}
          {ticket.resolution && (
            <div style={{ background: '#f0fdf4', borderRadius: 16, border: '1px solid #a7f3d0', padding: '24px 28px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>✅ Resolution</div>
              <p style={{ fontSize: 15, color: '#065f46', lineHeight: 1.75, margin: 0 }}>{ticket.resolution}</p>
            </div>
          )}

          {/* Status History */}
          {ticket.statusHistory?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Activity</div>
              <TicketStatusTimeline statusHistory={ticket.statusHistory} />
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Status Control */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Status</div>
            {canUpdateStatus ? (
              <>
                <select
                  value={selectedStatus || ticket.status}
                  disabled={updatingStatus}
                  onChange={(e) => {
                    const val = e.target.value
                    setSelectedStatus(val)
                    if (val !== 'RESOLVED') { setResolution(''); setSelectedStatus(''); handleStatusChange(val) }
                  }}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e5e5', fontSize: 13, fontWeight: 500, background: '#fafafa', cursor: 'pointer', outline: 'none' }}
                >
                  {['OPEN','IN_PROGRESS','WAITING_FOR_USER','RESOLVED','CLOSED','REJECTED','REOPENED'].map(s => (
                    <option key={s} value={s} disabled={!allowedTransitions.includes(s as TicketStatus)}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                {selectedStatus === 'RESOLVED' && (
                  <div style={{ marginTop: 12 }}>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Describe how this was resolved..."
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e5e5', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <button
                      onClick={() => handleStatusChange('RESOLVED')}
                      disabled={updatingStatus || !resolution.trim()}
                      style={{ marginTop: 8, width: '100%', padding: '10px', background: resolution.trim() ? '#1a1a1a' : '#e5e5e5', color: resolution.trim() ? '#fff' : '#999', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: resolution.trim() ? 'pointer' : 'not-allowed' }}
                    >
                      {updatingStatus ? 'Updating...' : 'Mark as Resolved'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <span style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: status.bg, color: status.color, display: 'inline-block' }}>
                {ticket.status.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {/* People */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>People</div>

            {/* Reporter */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#bbb', fontWeight: 600, marginBottom: 8 }}>REPORTER</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
                  {ticket.reporter?.profilePhoto ? (
                    <img src={ticket.reporter.profilePhoto} alt={reporterName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.textContent = avatarInitials(reporterName) }} />
                  ) : avatarInitials(reporterName)}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{reporterName}</span>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <div style={{ fontSize: 11, color: '#bbb', fontWeight: 600, marginBottom: 8 }}>ASSIGNEE</div>
              {canAssign ? (
                <select
                  value={ticket.assignedToId || ''}
                  disabled={assigning}
                  onChange={(e) => handleAssign(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e5e5', fontSize: 13, background: '#fafafa', outline: 'none' }}
                >
                  <option value="">Unassigned</option>
                  {ticket.project?.members?.map((member: any) => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.firstName} {member.user.lastName}
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: ticket.assignee ? 'linear-gradient(135deg, #f093fb, #f5576c)' : '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
                      {ticket.assignee?.profilePhoto ? (
                        <img src={ticket.assignee.profilePhoto} alt={assigneeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.textContent = avatarInitials(assigneeName) }} />
                      ) : ticket.assignee ? avatarInitials(assigneeName) : '?'}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: ticket.assignee ? '#1a1a1a' : '#bbb' }}>{assigneeName}</span>
                  </div>
                  {canSelfAssign && (
                    <button
                      onClick={handleSelfAssign}
                      disabled={selfAssigning}
                      style={{ marginTop: 10, width: '100%', padding: '9px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                    >
                      {selfAssigning ? 'Assigning...' : '✋ Assign to Me'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Dates</div>
            <DateRow icon="📅" label="Created" value={new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
            {ticket.resolvedAt && <DateRow icon="✅" label="Resolved" value={new Date(ticket.resolvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />}
            {ticket.closedAt && <DateRow icon="🔒" label="Closed" value={new Date(ticket.closedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />}
          </div>

          {/* Linked Task */}
          {ticket.task && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Linked Task</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#2563eb' }}>📌 {ticket.task.title}</div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Ticket"
        message="Are you sure you want to delete this ticket? This action cannot be undone."
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}

const DateRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#999', fontWeight: 500 }}>
      <span>{icon}</span>{label}
    </div>
    <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{value}</span>
  </div>
)

export default TicketDetailPage
