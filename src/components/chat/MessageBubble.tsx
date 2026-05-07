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
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditWindowOpen = (Date.now() - new Date(message.createdAt).getTime()) < 15 * 60 * 1000;

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
    if (!trimmed) {
      setEditError('Message cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      if (trimmed !== message.content && onEdit) {
        onEdit(message.id, trimmed);
      }
    } finally {
      setIsSaving(false);
    }
    setIsEditing(false);
    setShowActions(false);
  };

  const handleEditCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
    setIsSaving(false);
    setShowActions(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
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
                onChange={(e) => { setEditContent(e.target.value); setEditError(null); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isSaving) { e.preventDefault(); handleEditSave(); }
                  if (e.key === 'Escape') handleEditCancel();
                }}
                autoFocus
                rows={2}
                style={{
                  width: '100%',
                  minWidth: 200,
                  minHeight: 64,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  lineHeight: 1.5,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  background: '#fff',
                  color: '#1a1a1a',
                  boxSizing: 'border-box',
                  display: 'block',
                }}
              />
              {editError && (
                <span style={{ fontSize: 11, color: '#dc2626' }}>{editError}</span>
              )}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button
                  onClick={handleEditCancel}
                  style={{ padding: '3px 10px', borderRadius: 5, border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer', fontSize: 12 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={isSaving}
                  style={{ padding: '3px 10px', borderRadius: 5, border: 'none', background: '#1a1a1a', color: '#fff', cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: 12 }}
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
          <div style={{ display: 'flex', gap: 4, marginTop: 4, justifyContent: 'flex-end', alignItems: 'center' }}>
            {isEditWindowOpen && (
              <button
                onClick={() => { setIsEditing(true); setEditContent(message.content); }}
                title="Edit"
                style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', fontSize: 11, color: '#374151' }}
              >
                ✏️ Edit
              </button>
            )}
            {showDeleteConfirm ? (
              <>
                <span style={{ fontSize: 11, color: '#374151' }}>Delete this message?</span>
                <button
                  onClick={() => { if (onDelete) onDelete(message.id); setShowDeleteConfirm(false); setShowActions(false); }}
                  style={{ padding: '2px 8px', borderRadius: 4, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: 11 }}
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer', fontSize: 11, color: '#374151' }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleDelete}
                title="Delete"
                style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #fecaca', background: '#fff5f5', cursor: 'pointer', fontSize: 11, color: '#dc2626' }}
              >
                🗑️ Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
