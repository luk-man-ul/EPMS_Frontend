import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../../../utils/api'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import ConfirmationModal from '../../../../components/shared/ConfirmationModal'
import TicketStatusTimeline from '../../../admin/tickets/detail/components/TicketStatusTimeline'
import { getAllowedTransitions, formatStatus as formatStatusEnum, type TicketStatus } from '../../../../types/ticketWorkflow'

const TicketDetailPage = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

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

  const handleSelfAssign = async () => {
    try {
      setSelfAssigning(true)

      await api.patch(`/tickets/${ticket.id}/self-assign`)

      showToast('success', 'Ticket assigned to you successfully')
      await fetchTicket()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to self-assign ticket')
    } finally {
      setSelfAssigning(false)
    }
  }

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
    // Validate resolution is provided when transitioning to RESOLVED
    if (newStatus === 'RESOLVED' && !resolution.trim()) {
      showToast('error', 'Resolution is required when marking ticket as resolved')
      return
    }

    try {
      setUpdatingStatus(true)

      const payload: any = {
        status: newStatus,
      }

      // Include resolution only when transitioning to RESOLVED
      if (newStatus === 'RESOLVED') {
        payload.resolution = resolution.trim()
      }

      await api.patch(`/tickets/${ticket.id}/status`, payload)

      showToast('success', 'Status updated successfully')
      
      // Clear resolution input after successful update
      setResolution('')
      setSelectedStatus('')
      
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
      await api.delete(`/tickets/${ticket.id}`)
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
  const isUnassigned = !ticket.assignedToId

  // Check if employee is project member
  const isProjectMember = ticket.project?.members?.some(
    (member: any) => member.userId === user?.id
  )

  // Assignment permissions
  const canAssign = isAdmin || isLead
  const canSelfAssign = isEmployee && isUnassigned && isProjectMember

  // Status change permissions
  const canUpdateStatus = isAdmin || isLead || (isEmployee && isAssignee)

  // Edit/Delete permissions
  const canEditDelete = isReporter

  ////////////////////////////////////////////////////////////
  // STATUS TRANSITION LOGIC (Using Shared Workflow)
  ////////////////////////////////////////////////////////////

  const allowedTransitions = getAllowedTransitions(
    ticket?.status as TicketStatus || 'OPEN',
    user?.role as 'ADMIN' | 'TEAM_LEAD' | 'EMPLOYEE' || 'EMPLOYEE',
    isLead // Pass whether user is project lead for privileged transitions
  )

  ////////////////////////////////////////////////////////////
  // FORMATTERS
  ////////////////////////////////////////////////////////////

  const formatStatus = (status: string) =>
    formatStatusEnum(status as TicketStatus).toLowerCase()

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
              <>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>
                  {assignedTo}
                </div>
                
                {canSelfAssign && (
                  <button
                    onClick={handleSelfAssign}
                    disabled={selfAssigning}
                    style={{
                      marginTop: '8px',
                      padding: '8px 16px',
                      background: '#1a1a1a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: selfAssigning ? 'wait' : 'pointer',
                      opacity: selfAssigning ? 0.6 : 1,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!selfAssigning) e.currentTarget.style.background = '#333333'
                    }}
                    onMouseLeave={(e) => {
                      if (!selfAssigning) e.currentTarget.style.background = '#1a1a1a'
                    }}
                  >
                    {selfAssigning ? 'Assigning...' : '✋ Assign to Me'}
                  </button>
                )}
              </>
            )}
          </div>

          {/* STATUS */}
          <div>
            <div style={{ fontSize: '13px', color: '#666666', marginBottom: '4px' }}>
              Status
            </div>

            {canUpdateStatus ? (
              <>
                <select
                  value={selectedStatus || ticket.status}
                  disabled={updatingStatus}
                  onChange={(e) => {
                    const newStatus = e.target.value
                    setSelectedStatus(newStatus)
                    
                    // If not RESOLVED, submit immediately
                    if (newStatus !== 'RESOLVED') {
                      setResolution('')
                      setSelectedStatus('') // Clear before API call
                      handleStatusChange(newStatus)
                    }
                  }}
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
                    const isAllowed = allowedTransitions.includes(status as TicketStatus)
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

                {/* Resolution Input - Shows when RESOLVED is selected */}
                {selectedStatus === 'RESOLVED' && (
                  <div style={{ marginTop: '12px' }}>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Describe how this ticket was resolved..."
                      disabled={updatingStatus}
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e5e5e5',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        cursor: updatingStatus ? 'wait' : 'text',
                      }}
                    />
                    <button
                      onClick={() => handleStatusChange('RESOLVED')}
                      disabled={updatingStatus || !resolution.trim()}
                      style={{
                        marginTop: '8px',
                        padding: '8px 16px',
                        background: updatingStatus || !resolution.trim() ? '#e5e5e5' : '#1a1a1a',
                        color: updatingStatus || !resolution.trim() ? '#999999' : '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: updatingStatus || !resolution.trim() ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!updatingStatus && resolution.trim()) {
                          e.currentTarget.style.background = '#333333'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!updatingStatus && resolution.trim()) {
                          e.currentTarget.style.background = '#1a1a1a'
                        }
                      }}
                    >
                      {updatingStatus ? 'Updating...' : 'Mark as Resolved'}
                    </button>
                  </div>
                )}
              </>
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