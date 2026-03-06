interface Props {
  project: any
}

const ProjectTicketsTab = ({ project }: Props) => {
  const tickets = project.tickets || []

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' }
      case 'IN_PROGRESS':
        return { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }
      case 'RESOLVED':
        return { background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }
      case 'CLOSED':
        return { background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }
      default:
        return { background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }
    }
  }

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return { background: '#f3f4f6', color: '#6b7280' }
      case 'MEDIUM':
        return { background: '#dbeafe', color: '#1e40af' }
      case 'HIGH':
        return { background: '#fed7aa', color: '#9a3412' }
      case 'CRITICAL':
        return { background: '#fecaca', color: '#991b1b' }
      default:
        return { background: '#f3f4f6', color: '#6b7280' }
    }
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'BUG':
        return { background: '#fee2e2', color: '#991b1b', icon: '🐛' }
      case 'FEATURE':
        return { background: '#dbeafe', color: '#1e40af', icon: '✨' }
      case 'IMPROVEMENT':
        return { background: '#e0e7ff', color: '#3730a3', icon: '🔧' }
      case 'QUESTION':
        return { background: '#fef3c7', color: '#92400e', icon: '❓' }
      default:
        return { background: '#f3f4f6', color: '#374151', icon: '📋' }
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'No date'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#1a1a1a',
            margin: '0 0 4px 0'
          }}>
            Tickets ({tickets.length})
          </h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            Support tickets and issues for this project
          </p>
        </div>
      </div>

      {/* Empty State */}
      {tickets.length === 0 && (
        <div style={{
          padding: '64px 40px',
          background: '#fafafa',
          borderRadius: '12px',
          textAlign: 'center',
          border: '2px dashed #e5e5e5'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
          <p style={{ color: '#999', fontSize: '15px', margin: 0 }}>
            No tickets created for this project yet
          </p>
        </div>
      )}

      {/* Tickets Grid */}
      {tickets.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '20px'
        }}>
          {tickets.map((ticket: any) => {
            const typeStyle = getTypeStyle(ticket.type)
            
            return (
              <div
                key={ticket.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative'
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
                {/* Ticket Header */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '24px', lineHeight: 1 }}>
                      {typeStyle.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        margin: '0 0 8px 0',
                        lineHeight: '1.4'
                      }}>
                        {ticket.title}
                      </h4>

                      {ticket.description && (
                        <p style={{
                          fontSize: '13px',
                          color: '#666',
                          margin: 0,
                          lineHeight: '1.5',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {ticket.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Type, Status and Priority Badges */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}>
                  {ticket.type && (
                    <span style={{
                      ...typeStyle,
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      border: '1px solid currentColor'
                    }}>
                      {ticket.type}
                    </span>
                  )}

                  <span style={{
                    ...getStatusStyle(ticket.status),
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {ticket.status.replace('_', ' ')}
                  </span>

                  <span style={{
                    ...getPriorityStyle(ticket.priority),
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {ticket.priority}
                  </span>
                </div>

                {/* Ticket Details */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  paddingTop: '16px',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  {/* Reporter */}
                  {ticket.reporter && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: '#666'
                    }}>
                      <span>👤</span>
                      <span style={{ fontWeight: 500 }}>
                        {ticket.reporter.firstName} {ticket.reporter.lastName}
                      </span>
                      <span style={{ color: '#999' }}>reported</span>
                    </div>
                  )}

                  {/* Assigned To */}
                  {ticket.assignedTo && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: '#666'
                    }}>
                      <span>👨‍💼</span>
                      <span style={{ fontWeight: 500 }}>
                        {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                      </span>
                      <span style={{ color: '#999' }}>assigned</span>
                    </div>
                  )}

                  {/* Created Date */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    <span>📅</span>
                    <span>Created {formatDate(ticket.createdAt)}</span>
                  </div>

                  {/* Task Link */}
                  {ticket.task && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: '#666'
                    }}>
                      <span>🔗</span>
                      <span>Linked to task: {ticket.task.title}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProjectTicketsTab
