import type { TicketStatusHistoryItem } from '../../../../../types/ticket'

interface TicketStatusTimelineProps {
  statusHistory: TicketStatusHistoryItem[]
  onUpdateStatus?: () => void
}

const TicketStatusTimeline = ({ statusHistory, onUpdateStatus }: TicketStatusTimelineProps) => {
  const formatTimestamp = (date: string | Date) => {
    const d = new Date(date)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
        Status Timeline
      </h3>

      {statusHistory.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '32px', 
          color: '#999',
          fontSize: '14px'
        }}>
          No status history available
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {statusHistory.map((timeline, index) => (
          <div key={timeline.id} style={{ position: 'relative', paddingLeft: '28px' }}>
            {/* Timeline dot */}
            <div style={{
              position: 'absolute',
              left: '0',
              top: '4px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: index === statusHistory.length - 1 ? '#1a1a1a' : '#e5e5e5',
              border: index === statusHistory.length - 1 ? '2px solid #1a1a1a' : '2px solid #e5e5e5'
            }} />
            
            {/* Timeline line */}
            {index < statusHistory.length - 1 && (
              <div style={{
                position: 'absolute',
                left: '4.5px',
                top: '14px',
                width: '1px',
                height: 'calc(100% + 6px)',
                backgroundColor: '#f5f5f5'
              }} />
            )}

            <div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#1a1a1a', 
                marginBottom: '4px' 
              }}>
                {formatEnumLabel(timeline.status)}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                {timeline.changedBy ? `${timeline.changedBy.firstName} ${timeline.changedBy.lastName}` : 'System'} • {formatTimestamp(timeline.createdAt)}
              </div>
              {timeline.note && (
                <div style={{ 
                  fontSize: '13px', 
                  color: '#999',
                  fontStyle: 'italic',
                  marginTop: '4px'
                }}>
                  {timeline.note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}

      {onUpdateStatus && (
        <button
          onClick={onUpdateStatus}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #e5e5e5',
            background: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            color: '#1a1a1a',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
        >
          Update Status
        </button>
      )}
    </div>
  )
}

export default TicketStatusTimeline
