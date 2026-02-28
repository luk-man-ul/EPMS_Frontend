import { taskAttachmentsData } from '../../data/tasksData'

const TaskAttachments = () => {
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
          Attachments ({taskAttachmentsData.length})
        </h3>
        <button
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
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {taskAttachmentsData.map(attachment => (
          <div
            key={attachment.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#fafafa',
              borderRadius: '8px',
              transition: 'all 0.15s ease'
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
              fontSize: '18px'
            }}>
              📎
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a', marginBottom: '2px' }}>
                {attachment.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {attachment.size} • {attachment.uploadedBy} • {attachment.uploadedAt}
              </div>
            </div>
            <button
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e5e5e5',
                background: '#fff',
                fontSize: '12px',
                fontWeight: 500,
                color: '#1a1a1a',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskAttachments
