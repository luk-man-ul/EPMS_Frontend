import { useState } from 'react';
import type { ChatMessage } from './types';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  /** Called when user clicks Edit — parent populates the main input */
  onEditRequest?: (messageId: string, currentContent: string) => void;
  onDelete?: (messageId: string) => void;
}

export function MessageBubble({ message, isOwnMessage, onEditRequest, onDelete }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit window: 15 minutes from message creation
  const isEditWindowOpen =
    (Date.now() - new Date(message.createdAt).getTime()) < 15 * 60 * 1000;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getUserInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // Deleted message — show placeholder, no actions
  if (message.isDeleted) {
    return (
      <div className={`message-bubble-container ${isOwnMessage ? 'own-message' : 'other-message'}`}>
        {!isOwnMessage && <div className="message-avatar" />}
        <div className="message-content-wrapper">
          <div
            className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`}
            style={{ opacity: 0.5, fontStyle: 'italic' }}
          >
            <p className="message-text" style={{ color: '#9ca3af' }}>
              This message was deleted
            </p>
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
      onMouseLeave={() => setShowActions(false)}
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

        {/* Message bubble — display only, no inline edit UI */}
        <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`}>
          <p className="message-text">{message.content}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
            {message.isEdited && (
              <span
                style={{
                  fontSize: 10,
                  color: isOwnMessage ? 'rgba(255,255,255,0.6)' : '#9ca3af',
                  fontStyle: 'italic',
                }}
              >
                (edited)
              </span>
            )}
            <span className="message-time">{formatTime(message.createdAt)}</span>
          </div>
        </div>

        {/* Hover action buttons — Edit triggers main input, not inline edit */}
        {isOwnMessage && showActions && (
          <div
            style={{
              display: 'flex',
              gap: 4,
              marginTop: 4,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            {isEditWindowOpen && (
              <button
                onClick={() => {
                  setShowActions(false);
                  onEditRequest?.(message.id, message.content);
                }}
                title="Edit message"
                style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  border: '1px solid #e5e5e5',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 11,
                  color: '#374151',
                }}
              >
                ✏️ Edit
              </button>
            )}

            {showDeleteConfirm ? (
              <>
                <span style={{ fontSize: 11, color: '#374151' }}>Delete this message?</span>
                <button
                  onClick={() => {
                    onDelete?.(message.id);
                    setShowDeleteConfirm(false);
                    setShowActions(false);
                  }}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    border: 'none',
                    background: '#dc2626',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    border: '1px solid #ddd',
                    background: '#f5f5f5',
                    cursor: 'pointer',
                    fontSize: 11,
                    color: '#374151',
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete message"
                style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  border: '1px solid #fecaca',
                  background: '#fff5f5',
                  cursor: 'pointer',
                  fontSize: 11,
                  color: '#dc2626',
                }}
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
