interface TicketProblemDescriptionProps {
  ticket: {
    description: string
    type: string
    createdAt: string
    reporter?: {
      firstName: string
      lastName: string
    }
    assignee?: {
      firstName: string
      lastName: string
    } | null
  }
}

const TicketProblemDescription = ({ ticket }: TicketProblemDescriptionProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatEnumLabel = (value: string) => {
    return value
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e5e5',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
        Problem Description
      </h3>

      <p style={{ 
        fontSize: '14px', 
        color: '#666', 
        lineHeight: '1.6',
        marginBottom: '20px',
        whiteSpace: 'pre-wrap'
      }}>
        {ticket.description || 'No description provided'}
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #f5f5f5'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            Created By
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
            {ticket.reporter 
              ? `${ticket.reporter.firstName} ${ticket.reporter.lastName}`
              : 'Unknown'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            Assigned To
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
            {ticket.assignee 
              ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
              : 'Unassigned'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            Created At
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
            {formatDate(ticket.createdAt)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            Type
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
            {formatEnumLabel(ticket.type)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketProblemDescription
