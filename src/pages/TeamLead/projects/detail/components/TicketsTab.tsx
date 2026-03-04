import { useNavigate } from 'react-router-dom'
import { formatEnumLabel } from '../../../../../types/enums'

interface Props {
  tickets: any[]
}

const TicketsTab = ({ tickets }: Props) => {
  const navigate = useNavigate()

  if (!tickets || tickets.length === 0)
    return <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No tickets found</div>

  const handleTicketClick = (ticketId: string) => {
    navigate(`/app/tickets/${ticketId}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          onClick={() => handleTicketClick(ticket.id)}
          style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #e5e5e5',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#d4d4d4'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e5e5'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '8px'
          }}>
            <strong style={{ 
              fontSize: '15px', 
              color: '#1a1a1a',
              flex: 1
            }}>
              {ticket.title}
            </strong>
            <span style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              background: getStatusColor(ticket.status).bg,
              color: getStatusColor(ticket.status).text,
            }}>
              {formatEnumLabel(ticket.status)}
            </span>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '8px',
            fontSize: '13px',
            color: '#666'
          }}>
            <div>
              <span style={{ fontWeight: 500 }}>Priority:</span> {formatEnumLabel(ticket.priority)}
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>Reporter:</span> {ticket.reporter || 'Unknown'}
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>Assignee:</span> {ticket.assignee || 'Unassigned'}
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>Created:</span> {new Date(ticket.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Helper function to get status colors
function getStatusColor(status: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    OPEN: { bg: '#dbeafe', text: '#1e40af' },
    IN_PROGRESS: { bg: '#fef3c7', text: '#b45309' },
    WAITING_FOR_USER: { bg: '#fce7f3', text: '#9f1239' },
    RESOLVED: { bg: '#d1fae5', text: '#065f46' },
    CLOSED: { bg: '#e5e7eb', text: '#374151' },
    REJECTED: { bg: '#fee2e2', text: '#991b1b' },
    REOPENED: { bg: '#fef3c7', text: '#b45309' },
  }
  return colors[status] || { bg: '#f5f5f5', text: '#666666' }
}

export default TicketsTab