import type { ChatMessage } from './types';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
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

  return (
    <div className={`message-bubble-container ${isOwnMessage ? 'own-message' : 'other-message'}`}>
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
          <p className="message-text">{message.content}</p>
          <span className="message-time">{formatTime(message.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
