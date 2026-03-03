import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../../../utils/api'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import ConfirmationModal from '../../../../components/shared/ConfirmationModal'
import TicketStatusTimeline from '../../../admin/tickets/detail/components/TicketStatusTimeline'

const TicketDetailPage = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<'restricted' | 'notfound' | 'failed' | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { showToast } = useToast()

  ////////////////////////////////////////////////////////////
  // FETCH
  ////////////////////////////////////////////////////////////

  const fetchTicket = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await api.get(`/tickets/${ticketId}`)
      setTicket(res.data)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('restricted')
      } else if (err.response?.status === 404) {
        setError('notfound')
      } else {
        setError('failed')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ticketId) fetchTicket()
  }, [ticketId, navigate])

  ////////////////////////////////////////////////////////////
  // ACTIONS
  ////////////////////////////////////////////////////////////

  const handleAssign = async (userId: string) => {
    try {
      setAssigning(true)

      await api.patch(`/tickets/${ticket.id}/assign`, {
        assignedToId: userId || null,
      })

      showToast('success', 'Ticket assigned successfully')
      await fetchTicket()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to assign ticket')
    } finally {
      setAssigning(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    // Safety check: prevent invalid transitions
    if (!allowedTransitions.includes(newStatus)) {
      showToast('error', 'Invalid status transition')
      return
    }

    try {
      setUpdatingStatus(true)

      await api.patch(`/tickets/${ticket.id}/status`, {
        status: newStatus,
      })

      showToast('success', 'Status updated successfully')
      await fetchTicket()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true)
      await api.patch(`/tickets/${ticket.id}`, { isDeleted: true })
      showToast('success', 'Ticket deleted successfully')
      navigate('/app/tickets')
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to delete ticket')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  ////////////////////////////////////////////////////////////
  // LOADING + ERROR STATES
  ////////////////////////////////////////////////////////////

  if (loading) return <div>Loading ticket...</div>

  if (error === 'restricted') {
    return <div>🔒 Restricted Access</div>
  }

  if (error === 'notfound') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>
          Ticket Not Found
        </div>
        <button
          onClick={() => navigate('/app/tickets')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#1a1a1a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          ← Back to Tickets
        </button>
      </div>
    )
  }

  if (error === 'failed') return <div>Failed to load ticket</div>
  if (!ticket) return null

  ////////////////////////////////////////////////////////////
  // ROLE LOGIC
  ////////////////////////////////////////////////////////////

  const isAdmin = user?.role === 'ADMIN'
  const isLead =
    user?.role === 'TEAM_LEAD' &&
    ticket.project?.leadId === user?.id
  const isEmployee = user?.role === 'EMPLOYEE'

  const isAssignee = ticket.assignedToId === user?.id
  const isReporter = ticket.reporterId === user?.id

  const canUpdateStatus = isAdmin || isLead || isAssignee
  const canAssign = isAdmin || isLead
  const canEditDelete = isReporter

  ////////////////////////////////////////////////////////////
  // STATUS TRANSITION LOGIC
  ////////////////////////////////////////////////////////////

  const getAllowedTransitions = (currentStatus: string, role: string): string[] => {
    // Admin can transition to any status
    if (role === 'ADMIN') {
      return [
        'OPEN',
        'IN_PROGRESS',
        'WAITING_FOR_USER',
        'RESOLVED',
        'CLOSED',
        'REJECTED',
        'REOPENED',
      ]
    }

    // Replicate backend transition rules
    const transitions: Record<string, string[]> = {
      OPEN: ['IN_PROGRESS', 'REJECTED'],
      IN_PROGRESS: ['WAITING_FOR_USER', 'RESOLVED'],
      WAITING_FOR_USER: ['IN_PROGRESS', 'RESOLVED'],
      RESOLVED: ['CLOSED', 'REOPENED'],
      CLOSED: [],
      REJECTED: [],
      REOPENED: ['IN_PROGRESS'],
    }

    // Always allow staying in current status
    return [currentStatus, ...(transitions[currentStatus] || [])]
  }

  const allowedTransitions = getAllowedTransitions(
    ticket?.status || 'OPEN',
    user?.role || 'EMPLOYEE'
  )

  ////////////////////////////////////////////////////////////
  // FORMATTERS
  ////////////////////////////////////////////////////////////

  const formatStatus = (status: string) =>
    status.replace(/_/g, ' ').toLowerCase()

  const formatPriority = (priority: string) =>
    priority.toLowerCase()

  const assignedTo = ticket.assignee
    ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
    : 'Unassigned'

  const reporter = `${ticket.reporter.firstName} ${ticket.reporter.lastName}`

  ////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/app/tickets')}
        style={{
          background: 'none',
          border: 'none',
          color: '#666666',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '24px',
        }}
      >
        ← Back to Tickets
      </button>

      {/* Main Container */}
      <div
        style={{
          background: '#ffffff',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid #e5e5e5',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
            }}
          >
            {ticket.title}
          </h1>

          {canEditDelete && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => navigate(`/app/tickets/${ticket.id}/edit`)}
                style={{
                  padding: '8px 16px',
                  background: '#fafafa',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f5f5f5'
                  e.currentTarget.style.borderColor = '#d4d4d4'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fafafa'
                  e.currentTarget.style.borderColor = '#e5e5e5'
                }}
              >
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                style={{
                  padding: '8px 16px',
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#dc2626',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fecaca'
                  e.currentTarget.style.borderColor = '#fca5a5'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fee2e2'
                  e.currentTarget.style.borderColor = '#fecaca'
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Meta Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <Meta label="Ticket ID" value={ticket.id} mono />
          <Meta label="Project" value={ticket.project?.name} />
          <Meta label="Reporter" value={reporter} />

          {/* ASSIGNED TO */}
          <div>
            <div style={{ fontSize: '13px', color: '#666666', marginBottom: '4px' }}>
              Assigned To
            </div>

            {canAssign ? (
              <select
                value={ticket.assignedToId || ''}
                disabled={assigning}
                onChange={(e) => handleAssign(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #e5e5e5',
                  fontSize: '14px',
                }}
              >
                <option value="">Unassigned</option>

                {ticket.project?.members?.map((member: any) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.firstName} {member.user.lastName}
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ fontSize: '16px', fontWeight: 600 }}>
                {assignedTo}
              </div>
            )}
          </div>

          {/* STATUS */}
          <div>
            <div style={{ fontSize: '13px', color: '#666666', marginBottom: '4px' }}>
              Status
            </div>

            {canUpdateStatus && !isEmployee ? (
              <select
                value={ticket.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #e5e5e5',
                  fontSize: '14px',
                  cursor: updatingStatus ? 'wait' : 'pointer',
                }}
              >
                {[
                  'OPEN',
                  'IN_PROGRESS',
                  'WAITING_FOR_USER',
                  'RESOLVED',
                  'CLOSED',
                  'REJECTED',
                  'REOPENED',
                ].map((status) => {
                  const isAllowed = allowedTransitions.includes(status)
                  return (
                    <option
                      key={status}
                      value={status}
                      disabled={!isAllowed}
                      style={{
                        color: !isAllowed ? '#999999' : '#1a1a1a',
                        opacity: !isAllowed ? 0.6 : 1,
                        cursor: !isAllowed ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {status.replace(/_/g, ' ')}
                    </option>
                  )
                })}
              </select>
            ) : (
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {formatStatus(ticket.status)}
              </div>
            )}
          </div>

          <Meta label="Priority" value={formatPriority(ticket.priority)} />
          <Meta
            label="Created At"
            value={new Date(ticket.createdAt).toLocaleString()}
          />

          {ticket.resolvedAt && (
            <Meta
              label="Resolved At"
              value={new Date(ticket.resolvedAt).toLocaleString()}
            />
          )}

          {ticket.closedAt && (
            <Meta
              label="Closed At"
              value={new Date(ticket.closedAt).toLocaleString()}
            />
          )}
        </div>

        {/* Description */}
        <Section title="Description">
          {ticket.description}
        </Section>

        {/* Resolution */}
        {ticket.resolution && (
          <Section title="Resolution">
            {ticket.resolution}
          </Section>
        )}

        {/* Status History */}
        {ticket.statusHistory && ticket.statusHistory.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <TicketStatusTimeline 
              statusHistory={ticket.statusHistory || []}
            />
          </div>
        )}
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

const Meta = ({ label, value, mono }: any) => (
  <div>
    <div style={{ fontSize: '13px', color: '#666666', marginBottom: '4px' }}>
      {label}
    </div>
    <div
      style={{
        fontSize: '16px',
        fontWeight: 600,
        fontFamily: mono ? 'monospace' : 'inherit',
        textTransform: 'capitalize',
      }}
    >
      {value}
    </div>
  </div>
)

const Section = ({ title, children }: any) => (
  <div
    style={{
      marginBottom: '24px',
      padding: '16px',
      background: '#fafafa',
      borderRadius: '10px',
    }}
  >
    <div style={{ fontSize: '13px', color: '#666666', marginBottom: '8px' }}>
      {title}
    </div>
    <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
      {children}
    </div>
  </div>
)

export default TicketDetailPage