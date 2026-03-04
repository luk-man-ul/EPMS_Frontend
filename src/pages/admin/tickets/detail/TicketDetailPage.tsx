import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import api from '../../../../utils/api'
import { assignTicket } from '../tickets.api'
import { formatStatus as formatStatusEnum, type TicketStatus } from '../../../../types/ticketWorkflow'
import TicketProblemDescription from './components/TicketProblemDescription'
import TicketDiscussionThread from './components/TicketDiscussionThread'
import TicketSolutionLogs from './components/TicketSolutionLogs'
import TicketStatusTimeline from './components/TicketStatusTimeline'
import TicketAttachments from './components/TicketAttachments'

const TicketDetailPage = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [projectMembers, setProjectMembers] = useState<Array<{ id: string; name: string }>>([])
  const [assigningTicket, setAssigningTicket] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [resolution, setResolution] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const ticketResponse = await api.get(`/tickets/${ticketId}`)
        setTicket(ticketResponse.data)
        
        // Fetch project members if ticket has a project
        if (ticketResponse.data.projectId) {
          try {
            const projectResponse = await api.get(`/projects/${ticketResponse.data.projectId}`)
            const members = projectResponse.data.members || []
            
            // Transform members to dropdown format
            const memberOptions = members.map((member: any) => ({
              id: member.user.id,
              name: `${member.user.firstName} ${member.user.lastName}`
            }))
            
            setProjectMembers(memberOptions)
          } catch (err) {
            console.error('Failed to fetch project members:', err)
          }
        }
      } catch (error) {
        console.error('Failed to fetch ticket details:', error)
        showToast('error', 'Failed to load ticket details')
      } finally {
        setLoading(false)
      }
    }

    if (ticketId) {
      fetchData()
    }
  }, [ticketId, showToast])

  const handleBack = () => {
    navigate('/admin/tickets')
  }

  const handleAssignTicket = async (assignedToId: string) => {
    if (!ticketId) return

    try {
      setAssigningTicket(true)
      await assignTicket(ticketId, assignedToId)
      
      // Refresh ticket data
      const response = await api.get(`/tickets/${ticketId}`)
      setTicket(response.data)
      
      showToast('success', 'Ticket assigned successfully')
    } catch (error) {
      console.error('Failed to assign ticket:', error)
      showToast('error', 'Failed to assign ticket')
    } finally {
      setAssigningTicket(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!ticketId) return

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

      await api.patch(`/tickets/${ticketId}/status`, payload)

      showToast('success', 'Status updated successfully')
      
      // Clear resolution input after successful update
      setResolution('')
      setSelectedStatus('')
      
      // Refresh ticket data
      const response = await api.get(`/tickets/${ticketId}`)
      setTicket(response.data)
    } catch (error: any) {
      console.error('Failed to update status:', error)
      showToast('error', error.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        Loading ticket details...
      </div>
    )
  }

  if (!ticket) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        Ticket not found
      </div>
    )
  }

  const getPriorityStyle = (priority: string) => {
    const styles: Record<string, React.CSSProperties> = {
      URGENT: { backgroundColor: '#1a1a1a', color: '#fff' },
      HIGH: { backgroundColor: '#dc2626', color: '#fff' },
      MEDIUM: { backgroundColor: '#f59e0b', color: '#fff' },
      LOW: { backgroundColor: '#10b981', color: '#fff' },
    }
    return styles[priority] || styles.MEDIUM
  }

  const getStatusStyle = (status: string) => {
    const styles: Record<string, React.CSSProperties> = {
      OPEN: { backgroundColor: '#3b82f6', color: '#fff' },
      IN_PROGRESS: { backgroundColor: '#f59e0b', color: '#fff' },
      WAITING_FOR_USER: { backgroundColor: '#8b5cf6', color: '#fff' },
      RESOLVED: { backgroundColor: '#10b981', color: '#fff' },
      CLOSED: { backgroundColor: '#6b7280', color: '#fff' },
      REJECTED: { backgroundColor: '#dc2626', color: '#fff' },
      REOPENED: { backgroundColor: '#f59e0b', color: '#fff' },
    }
    return styles[status] || { backgroundColor: '#f0f0f0', color: '#1a1a1a' }
  }

  const formatEnumLabel = (value: string) => {
    return formatStatusEnum(value as TicketStatus)
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Add pulse animation for loading indicator */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button
            onClick={handleBack}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
              padding: '4px'
            }}
          >
            ←
          </button>
          <span style={{
            fontWeight: 600,
            color: '#666',
            fontSize: '14px',
            fontFamily: 'monospace'
          }}>
            {ticket.id.slice(0, 8).toUpperCase()}
          </span>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 600,
            color: '#1a1a1a',
            letterSpacing: '-0.01em'
          }}>
            {ticket.title}
          </h1>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
          marginLeft: '44px',
          flexWrap: 'wrap'
        }}>
          <span style={{
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500,
            border: '1px solid #e5e5e5',
            ...getPriorityStyle(ticket.priority)
          }}>
            {formatEnumLabel(ticket.priority)} Priority
          </span>

          {/* Status Dropdown - ADMIN can change to any status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 500,
                border: '1px solid #e5e5e5',
                cursor: updatingStatus ? 'wait' : 'pointer',
                ...getStatusStyle(selectedStatus || ticket.status)
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
              ].map((status) => (
                <option key={status} value={status}>
                  {formatEnumLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <span style={{ fontSize: '14px', color: '#666' }}>
            {ticket.project?.name || 'No Project'}
          </span>
          
          {/* Assignment Dropdown - Only for ADMIN */}
          {user?.role === 'ADMIN' && (
            <>
              <span style={{ fontSize: '14px', color: '#666' }}>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {assigningTicket ? 'Assigning...' : 'Assigned to:'}
                </span>
                <select
                  value={ticket.assignedToId || ''}
                  onChange={(e) => handleAssignTicket(e.target.value)}
                  disabled={assigningTicket}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e5e5',
                    fontSize: '13px',
                    background: assigningTicket ? '#f5f5f5' : '#fff',
                    cursor: assigningTicket ? 'not-allowed' : 'pointer',
                    fontWeight: 500,
                    color: assigningTicket ? '#999' : '#1a1a1a',
                    opacity: assigningTicket ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                {assigningTicket && (
                  <span style={{
                    fontSize: '12px',
                    color: '#666',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}>
                    ⏳
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Resolution Input - Shows when RESOLVED is selected */}
        {selectedStatus === 'RESOLVED' && (
          <div style={{ 
            marginLeft: '44px', 
            marginTop: '16px',
            background: '#fafafa',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #e5e5e5'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#1a1a1a' }}>
              Resolution Required
            </div>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Describe how this ticket was resolved..."
              disabled={updatingStatus}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                cursor: updatingStatus ? 'wait' : 'text',
                background: '#fff'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={() => handleStatusChange('RESOLVED')}
                disabled={updatingStatus || !resolution.trim()}
                style={{
                  padding: '10px 20px',
                  background: updatingStatus || !resolution.trim() ? '#e5e5e5' : '#10b981',
                  color: updatingStatus || !resolution.trim() ? '#999999' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: updatingStatus || !resolution.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!updatingStatus && resolution.trim()) {
                    e.currentTarget.style.background = '#059669'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!updatingStatus && resolution.trim()) {
                    e.currentTarget.style.background = '#10b981'
                  }
                }}
              >
                {updatingStatus ? 'Updating...' : 'Mark as Resolved'}
              </button>
              <button
                onClick={() => {
                  setSelectedStatus('')
                  setResolution('')
                }}
                disabled={updatingStatus}
                style={{
                  padding: '10px 20px',
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: updatingStatus ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!updatingStatus) {
                    e.currentTarget.style.background = '#fafafa'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!updatingStatus) {
                    e.currentTarget.style.background = '#fff'
                  }
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Resolution Section - Show when ticket is RESOLVED or CLOSED */}
          {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
            <div style={{
              background: ticket.resolution ? '#f0fdf4' : '#fef3c7',
              border: ticket.resolution ? '1px solid #86efac' : '1px solid #fcd34d',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>{ticket.resolution ? '✅' : '⚠️'}</span>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: ticket.resolution ? '#166534' : '#92400e',
                  margin: 0
                }}>
                  Resolution
                </h3>
              </div>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: ticket.resolution ? '#166534' : '#92400e',
                margin: 0,
                whiteSpace: 'pre-wrap',
                fontStyle: ticket.resolution ? 'normal' : 'italic'
              }}>
                {ticket.resolution || 'No resolution description provided for this ticket.'}
              </p>
            </div>
          )}

          <TicketProblemDescription 
            ticket={{
              description: ticket.description,
              type: ticket.type,
              createdAt: ticket.createdAt,
              reporter: ticket.reporter,
              assignee: ticket.assignee
            }}
          />
          <TicketDiscussionThread 
            comments={ticket.comments || []}
          />
          <TicketSolutionLogs 
            solutions={[]}
          />
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <TicketStatusTimeline 
            statusHistory={ticket.statusHistory || []}
          />
          <TicketAttachments 
            attachments={[]}
          />
        </div>
      </div>
    </div>
  )
}

export default TicketDetailPage
