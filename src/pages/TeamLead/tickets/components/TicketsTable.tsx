import { useNavigate } from 'react-router-dom'

interface Ticket {
  id: string
  title: string
  project: string
  assignedTo: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  type: 'bug' | 'support' | 'dependency'
  createdDate: string
  description: string
}

interface TicketsTableProps {
  tickets: Ticket[]
}

const TicketsTable = ({ tickets }: TicketsTableProps) => {
  const navigate = useNavigate()

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { label: 'Urgent', color: '#ef4444', bg: '#fee2e2', icon: '🔴' }
      case 'high':
        return { label: 'High', color: '#f59e0b', bg: '#fef3c7', icon: '🟠' }
      case 'medium':
        return { label: 'Medium', color: '#4a90e2', bg: '#dbeafe', icon: '🟡' }
      case 'low':
        return { label: 'Low', color: '#10b981', bg: '#d1fae5', icon: '🟢' }
      default:
        return { label: priority, color: '#666666', bg: '#f5f5f5', icon: '⚪' }
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return { label: 'Open', color: '#ef4444', bg: '#fee2e2' }
      case 'in-progress':
        return { label: 'In Progress', color: '#4a90e2', bg: '#dbeafe' }
      case 'resolved':
        return { label: 'Resolved', color: '#10b981', bg: '#d1fae5' }
      case 'closed':
        return { label: 'Closed', color: '#666666', bg: '#f5f5f5' }
      default:
        return { label: status, color: '#666666', bg: '#f5f5f5' }
    }
  }

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'bug':
        return { label: 'Bug', icon: '🐛' }
      case 'support':
        return { label: 'Support', icon: '💬' }
      case 'dependency':
        return { label: 'Dependency', icon: '🔗' }
      default:
        return { label: type, icon: '📋' }
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      {tickets.map((ticket) => {
        const priorityConfig = getPriorityConfig(ticket.priority)
        const statusConfig = getStatusConfig(ticket.status)
        const typeConfig = getTypeConfig(ticket.type)

        return (
          <div
            key={ticket.id}
            style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e5e5e5',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d4d4d4'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e5e5'
              e.currentTarget.style.boxShadow = 'none'
            }}
            onClick={() => navigate(`/app/tickets/${ticket.id}`)}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
            }}>
              {/* Priority Indicator */}
              <div style={{
                width: '4px',
                height: '80px',
                borderRadius: '2px',
                background: priorityConfig.color,
                flexShrink: 0,
              }} />

              {/* Ticket Content */}
              <div style={{ flex: 1 }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: '#1a1a1a',
                  }}>
                    {ticket.id}
                  </span>

                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: statusConfig.color,
                    background: statusConfig.bg,
                  }}>
                    {statusConfig.label}
                  </span>

                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: priorityConfig.color,
                    background: priorityConfig.bg,
                  }}>
                    {priorityConfig.icon} {priorityConfig.label}
                  </span>

                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#666666',
                    background: '#f5f5f5',
                  }}>
                    {typeConfig.icon} {typeConfig.label}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: '8px',
                  lineHeight: '1.4',
                }}>
                  {ticket.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '13px',
                  color: '#666666',
                  marginBottom: '12px',
                  lineHeight: '1.6',
                }}>
                  {ticket.description}
                </p>

                {/* Footer */}
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  fontSize: '12px',
                  color: '#666666',
                }}>
                  <span>📁 {ticket.project}</span>
                  <span>👤 {ticket.assignedTo}</span>
                  <span>📅 {new Date(ticket.createdDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/app/tickets/${ticket.id}`)
                }}
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
                  flexShrink: 0,
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
                View Details →
              </button>
            </div>
          </div>
        )
      })}

      {tickets.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e5e5',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
          <div style={{ fontSize: '16px', fontWeight: 500, color: '#666666' }}>
            No tickets found
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketsTable
