import { useState } from 'react'
import type { TicketComment } from '../../../../../types/ticket'

interface TicketDiscussionThreadProps {
  comments: TicketComment[]
  onAddComment?: (content: string, isAdminComment: boolean) => void
}

const TicketDiscussionThread = ({ comments, onAddComment }: TicketDiscussionThreadProps) => {
  const [newComment, setNewComment] = useState('')

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

  const handleReply = (isAdminComment: boolean) => {
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment, isAdminComment)
      setNewComment('')
    }
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e5e5',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
        Discussion Thread ({comments.length})
      </h3>

      {/* Reply Input */}
      {onAddComment && (
        <div style={{ marginBottom: '24px' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add to discussion..."
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
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              onClick={() => handleReply(false)}
              disabled={!newComment.trim()}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: newComment.trim() ? '#1a1a1a' : '#e5e5e5',
                color: '#fff',
                fontWeight: 500,
                cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (newComment.trim()) e.currentTarget.style.backgroundColor = '#333'
              }}
              onMouseLeave={(e) => {
                if (newComment.trim()) e.currentTarget.style.backgroundColor = '#1a1a1a'
              }}
            >
              Reply
            </button>
            <button
              onClick={() => handleReply(true)}
              disabled={!newComment.trim()}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                backgroundColor: '#fff',
                color: '#1a1a1a',
                fontWeight: 500,
                cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                transition: 'all 0.15s ease',
                opacity: newComment.trim() ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (newComment.trim()) e.currentTarget.style.backgroundColor = '#fafafa'
              }}
              onMouseLeave={(e) => {
                if (newComment.trim()) e.currentTarget.style.backgroundColor = '#fff'
              }}
            >
              Add as Admin
            </button>
          </div>
        </div>
      )}

      {/* Discussion List */}
      {comments.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '32px', 
          color: '#999',
          fontSize: '14px',
          background: '#fafafa',
          borderRadius: '8px'
        }}>
          No comments yet. Start the discussion!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map(discussion => (
          <div 
            key={discussion.id} 
            style={{ 
              padding: '16px',
              background: discussion.isAdminComment ? '#1a1a1a' : '#fafafa',
              borderRadius: '8px',
              border: discussion.isAdminComment ? '1px solid #1a1a1a' : 'none'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: discussion.isAdminComment ? '#fff' : '#1a1a1a' 
                }}>
                  {discussion.author ? `${discussion.author.firstName} ${discussion.author.lastName}` : 'Unknown'}
                </div>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 500,
                  backgroundColor: discussion.isAdminComment ? 'rgba(255,255,255,0.2)' : '#fff',
                  color: discussion.isAdminComment ? '#fff' : '#666',
                  border: discussion.isAdminComment ? 'none' : '1px solid #e5e5e5'
                }}>
                  {discussion.isAdminComment ? 'Admin' : 'User'}
                </span>
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: discussion.isAdminComment ? '#ccc' : '#999' 
              }}>
                {formatTimestamp(discussion.createdAt)}
              </div>
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: discussion.isAdminComment ? '#fff' : '#666', 
              lineHeight: '1.5' 
            }}>
              {discussion.content}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}

export default TicketDiscussionThread
