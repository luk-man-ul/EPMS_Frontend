import { taskCommentsData } from '../../data/tasksData'

const TaskComments = () => {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e5e5',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
        Comments ({taskCommentsData.length})
      </h3>

      {/* Comment Input */}
      <div style={{ marginBottom: '24px' }}>
        <textarea
          placeholder="Add a comment..."
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #e5e5e5',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical',
            minHeight: '80px',
            outline: 'none',
            transition: 'all 0.15s ease'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#1a1a1a'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#e5e5e5'}
        />
        <button
          style={{
            marginTop: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
        >
          Post Comment
        </button>
      </div>

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {taskCommentsData.map(comment => (
          <div key={comment.id} style={{ 
            padding: '16px',
            background: '#fafafa',
            borderRadius: '8px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
                {comment.author}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {comment.timestamp}
              </div>
            </div>
            <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
              {comment.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskComments
