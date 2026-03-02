import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import api from '../../../../utils/api'
import { getEmployeesForDropdown, type EmployeeOption } from '../employees.api'
import { assignTicket } from '../tickets.api'
import TicketProblemDescription from './components/TicketProblemDescription'
import TicketDiscussionThread from './components/TicketDiscussionThread'
import TicketSolutionLogs from './components/TicketSolutionLogs'
import TicketStatusTimeline from './components/TicketStatusTimeline'
import TicketAttachments from './components/TicketAttachments'
import TicketAdminActions from './components/TicketAdminActions'

const TicketDetailPage = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [assigningTicket, setAssigningTicket] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [ticketResponse, employeesData] = await Promise.all([
          api.get(`/tickets/${ticketId}`),
          getEmployeesForDropdown()
        ])
        setTicket(ticketResponse.data)
        setEmployees(employeesData)
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
    return value
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
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
          <span style={{
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500,
            border: '1px solid #e5e5e5',
            ...getStatusStyle(ticket.status)
          }}>
            {formatEnumLabel(ticket.status)}
          </span>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {ticket.project?.name || 'No Project'}
          </span>
          
          {/* Assignment Dropdown - Only for ADMIN */}
          {user?.role === 'ADMIN' && (
            <>
              <span style={{ fontSize: '14px', color: '#666' }}>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Assigned to:</span>
                <select
                  value={ticket.assignedToId || ''}
                  onChange={(e) => handleAssignTicket(e.target.value)}
                  disabled={assigningTicket}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e5e5',
                    fontSize: '13px',
                    background: '#fff',
                    cursor: assigningTicket ? 'not-allowed' : 'pointer',
                    fontWeight: 500,
                    color: '#1a1a1a',
                  }}
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Admin Actions Bar */}
      <TicketAdminActions />

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <TicketProblemDescription />
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
