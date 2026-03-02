import type { Attachment } from '../../../../../types/ticket'

interface TicketAttachmentsProps {
  attachments: Attachment[]
  onUpload?: (file: File) => void
  onDownload?: (attachmentId: string) => void
}

const TicketAttachments = ({ attachments, onUpload, onDownload }: TicketAttachmentsProps) => {
  const getFileIcon = (type: string) => {
    if (type.includes('image')) return '🖼️'
    if (type.includes('pdf')) return '📄'
    if (type.includes('text')) return '📝'
    return '📎'
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e5e5',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
          Attachments ({attachments.length})
        </h3>
        {onUpload && (
          <button
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) onUpload(file)
              }
              input.click()
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              background: '#fff',
              fontSize: '13px',
              fontWeight: 500,
              color: '#1a1a1a',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
          >
            + Upload
          </button>
        )}
      </div>

      {attachments.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '32px', 
          color: '#999',
          fontSize: '14px',
          background: '#fafafa',
          borderRadius: '8px'
        }}>
          No attachments yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {attachments.map(attachment => (
          <div
            key={attachment.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#fafafa',
              borderRadius: '8px',
              transition: 'all 0.15s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              {getFileIcon(attachment.type)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: '#1a1a1a', 
                marginBottom: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {attachment.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {attachment.size} • {attachment.uploadedBy}
              </div>
            </div>
            <button
              onClick={() => onDownload && onDownload(attachment.id)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #e5e5e5',
                background: '#fff',
                fontSize: '16px',
                color: '#666',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1a1a'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff'
                e.currentTarget.style.color = '#666'
              }}
            >
              ↓
            </button>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}

export default TicketAttachments
