import { useState } from 'react';
import type { ChatMessage } from './types';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}

export function MessageBubble({ message, isOwnMessage, onEdit, onDelete }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleEditSave = () => {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== message.content && onEdit) {
      onEdit(message.id, trimmed);
    }
    setIsEditing(false);
    setShowActions(false);
  };

  const handleEditCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
    setShowActions(false);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this message?') && onDelete) {
      onDelete(message.id);
    }
    setShowActions(false);
  };

  // Deleted message — show placeholder, no actions
  if (message.isDeleted) {
    return (
      <div className={`message-bubble-container ${isOwnMessage ? 'own-message' : 'other-message'}`}>
        {!isOwnMessage && <div className="message-avatar" />}
        <div className="message-content-wrapper">
          <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`} style={{ opacity: 0.5, fontStyle: 'italic' }}>
            <p className="message-text" style={{ color: '#9ca3af' }}>This message was deleted</p>
            <span className="message-time">{formatTime(message.createdAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`message-bubble-container ${isOwnMessage ? 'own-message' : 'other-message'}`}
      onMouseEnter={() => isOwnMessage && setShowActions(true)}
      onMouseLeave={() => { if (!isEditing) setShowActions(false); }}
    >
      {!isOwnMessage && (
        <div className="message-avatar">
          {message.sender.profilePhoto ? (
            <img src={message.sender.profilePhoto} alt={message.sender.firstName} />
          ) : (
            <div className="avatar-initials">
              {getUserInitials(message.sender.firstName, message.sender.lastName)}
            </div>
          )}
        </div>
      )}

      <div className="message-content-wrapper">
        {!isOwnMessage && (
          <div className="message-sender-name">
            {message.sender.firstName} {message.sender.lastName}
          </div>
        )}

        <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSave(); }
                  if (e.key === 'Escape') handleEditCancel();
                }}
                autoFocus
                rows={2}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: '1px solid #e5e5e5',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none',
                  background: '#fff',
                  color: '#1a1a1a',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button
                  onClick={handleEditCancel}
                  style={{ padding: '3px 10px', borderRadius: 5, border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer', fontSize: 12 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  style={{ padding: '3px 10px', borderRadius: 5, border: 'none', background: '#1a1a1a', color: '#fff', cursor: 'pointer', fontSize: 12 }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="message-text">{message.content}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                {message.isEdited && (
                  <span style={{ fontSize: 10, color: isOwnMessage ? 'rgba(255,255,255,0.6)' : '#9ca3af', fontStyle: 'italic' }}>
                    (edited)
                  </span>
                )}
                <span className="message-time">{formatTime(message.createdAt)}</span>
              </div>
            </>
          )}
        </div>

        {/* Action buttons — only for own messages, shown on hover */}
        {isOwnMessage && showActions && !isEditing && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setIsEditing(true); setEditContent(message.content); }}
              title="Edit"
              style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', fontSize: 11, color: '#374151' }}
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              title="Delete"
              style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #fecaca', background: '#fff5f5', cursor: 'pointer', fontSize: 11, color: '#dc2626' }}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
