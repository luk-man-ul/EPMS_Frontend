import { useState } from 'react'

interface CommentAuthor {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface Comment {
  id: string
  entityType: string
  entityId: string
  authorId: string
  content: string
  isDeleted: boolean
  author?: CommentAuthor
  createdAt: string | Date
}

interface TicketDiscussionThreadProps {
  comments: Comment[]
  onAddComment?: (content: string) => Promise<void>
}

const TicketDiscussionThread = ({ comments, onAddComment }: TicketDiscussionThreadProps) => {
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const formatTimestamp = (date: string | Date) => {
    const d = new Date(date)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const handleSubmit = async () => {
    if (!newComment.trim() || !onAddComment) return
    try {
      setSubmitting(true)
      await onAddComment(newComment.trim())
      setNewComment('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
        Discussion Thread ({comments.length})
      </h3>

      {/* Input */}
      {onAddComment && (
        <div style={{ marginBottom: '24px' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add to discussion... (Ctrl+Enter to submit)"
            disabled={submitting}
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
              transition: 'border-color 0.15s ease',
              boxSizing: 'border-box',
              background: submitting ? '#fafafa' : '#fff',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#1a1a1a' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e5e5' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: newComment.trim() && !submitting ? '#1a1a1a' : '#e5e5e5',
                color: newComment.trim() && !submitting ? '#fff' : '#999',
                fontWeight: 500,
                cursor: newComment.trim() && !submitting ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                transition: 'all 0.2s ease',
              }}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#999', fontSize: '14px', background: '#fafafa', borderRadius: '8px' }}>
          No comments yet. Start the discussion!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comments.map((comment) => (
            <div key={comment.id} style={{ padding: '14px 16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
                  {comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : 'Unknown'}
                </span>
                <span style={{ fontSize: '12px', color: '#999' }}>
                  {formatTimestamp(comment.createdAt)}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {comment.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TicketDiscussionThread
