import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Button } from '../ui';
import './MessageInput.css';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onCancelEdit: () => void;
  onTyping: (isTyping: boolean) => void;
  editingMessageId: string | null;
  editingMessageText: string;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  onEditMessage,
  onCancelEdit,
  onTyping,
  editingMessageId,
  editingMessageText,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editingMessageId;

  // When edit mode activates: populate input with the message text and focus
  useEffect(() => {
    if (isEditing) {
      setMessage(editingMessageText);
      // Focus and move cursor to end after state settles
      setTimeout(() => {
        const el = inputRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      }, 0);
    }
  }, [editingMessageId, editingMessageText, isEditing]);

  // When edit mode is cancelled externally, clear the input
  useEffect(() => {
    if (!isEditing) {
      setMessage('');
    }
  }, [isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Only fire typing indicator in normal (non-edit) mode
    if (!isEditing) {
      if (!isTyping) {
        setIsTyping(true);
        onTyping(true);
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 1000);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = message.trim();
    if (!trimmed || disabled) return;

    if (isEditing && editingMessageId) {
      // Edit mode: submit the edit
      onEditMessage(editingMessageId, trimmed);
      setMessage('');
    } else {
      // Normal mode: send new message
      onSendMessage(trimmed);
      setMessage('');
      setIsTyping(false);
      onTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape' && isEditing) {
      handleCancel();
    }
  };

  const handleCancel = () => {
    setMessage('');
    onCancelEdit();
    inputRef.current?.focus();
  };

  return (
    <div className="message-input-wrapper">
      {/* Edit mode indicator bar */}
      {isEditing && (
        <div className="edit-mode-bar">
          <span className="edit-mode-label">✏️ Editing message</span>
          <button
            type="button"
            onClick={handleCancel}
            className="edit-cancel-btn"
            title="Cancel edit (Esc)"
          >
            ✕ Cancel
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="message-input-container">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isEditing ? 'Edit your message...' : 'Type a message...'}
          disabled={disabled}
          className="message-input-field"
        />
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          variant="primary"
          size="md"
          className="message-send-button"
        >
          {isEditing ? 'Save' : 'Send'}
        </Button>
      </form>
    </div>
  );
}
