import { useNavigate } from 'react-router-dom'

interface Props {
  tickets: any[]
}

const TicketsTab = ({ tickets }: Props) => {
  const navigate = useNavigate()

  if (!tickets || tickets.length === 0) {
    return (
      <div style={{ 
        padding: '64px 32px', 
        background: '#fafafa', 
        borderRadius: '12px',
        textAlign: 'center',
        border: '2px dashed #e5e5e5'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
        <p style={{ color: '#999', fontSize: '15px', margin: 0 }}>
          No tickets found for this project
        </p>
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      BUG: '🐛',
      FEATURE: '✨',
      IMPROVEMENT: '🔧',
      QUESTION: '❓',
    }
    return icons[type] || '📋'
  }

  const getStatusBadgeStyle = (status: string) => {
    const styles: Record<string, { bg: string; color: string; border: string }> = {
      OPEN: { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
      IN_PROGRESS: { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
      RESOLVED: { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
      CLOSED: { bg: '#e5e7eb', color: '#374151', border: '#d1d5db' },
    }
    return styles[status] || { bg: '#f5f5f5', color: '#666666', border: '#e5e5e5' }
  }

  const getPriorityBadgeStyle = (priority: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      LOW: { bg: '#d1fae5', color: '#065f46' },
      MEDIUM: { bg: '#dbeafe', color: '#1e40af' },
      HIGH: { bg: '#fed7aa', color: '#b45309' },
      URGENT: { bg: '#fecaca', color: '#991b1b' },
    }
    return styles[priority] || { bg: '#f5f5f5', color: '#666666' }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#1a1a1a',
          margin: '0 0 4px 0'
        }}>
          Tickets ({tickets.length})
        </h3>
        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
          All tickets for this project
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '20px'
      }}>
        {tickets.map((ticket) => {
          const statusStyle = getStatusBadgeStyle(ticket.status)
          const priorityStyle = getPriorityBadgeStyle(ticket.priority)

          return (
            <div
              key={ticket.id}
              onClick={() => navigate(`/app/tickets/${ticket.id}`)}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e5e5e5',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = '#d4d4d4'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = '#e5e5e5'
              }}
            >
              {/* Header with Type Icon and Status */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {ticket.type && (
                    <span style={{
                      fontSize: '20px',
                      lineHeight: 1
                    }}>
                      {getTypeIcon(ticket.type)}
                    </span>
                  )}
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: statusStyle.bg,
                    color: statusStyle.color,
                    border: `1px solid ${statusStyle.border}`,
                  }}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>

                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: priorityStyle.bg,
                  color: priorityStyle.color,
                }}>
                  {ticket.priority}
                </span>
              </div>

              {/* Title */}
              <h4 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#1a1a1a',
                margin: '0 0 12px 0',
                lineHeight: '1.4',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {ticket.title}
              </h4>

              {/* Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #f0f0f0'
              }}>
                <div>
                  <div style={{
                    fontSize: '11px',
                    color: '#999',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}>
                    Reporter
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#1a1a1a',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {ticket.reporter?.firstName && ticket.reporter?.lastName
                      ? `${ticket.reporter.firstName} ${ticket.reporter.lastName}`
                      : 'Unknown'}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '11px',
                    color: '#999',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}>
                    Assignee
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#1a1a1a',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {ticket.assignee?.firstName && ticket.assignee?.lastName
                      ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
                      : 'Unassigned'}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '11px',
                    color: '#999',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}>
                    Created
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    fontWeight: 500
                  }}>
                    {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>

                {ticket.task && (
                  <div>
                    <div style={{
                      fontSize: '11px',
                      color: '#999',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '4px'
                    }}>
                      Linked Task
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#2563eb',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {ticket.task.title}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TicketsTab
