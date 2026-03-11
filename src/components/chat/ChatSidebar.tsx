import type { ChatRoom } from './types';
import { Badge } from '../ui';
import './ChatSidebar.css';

interface ChatSidebarProps {
  rooms: ChatRoom[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

export function ChatSidebar({ rooms, selectedRoomId, onSelectRoom }: ChatSidebarProps) {
  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'COMPANY':
        return '🏢';
      case 'TEAM':
        return '👥';
      case 'PROJECT':
        return '📁';
      case 'DIRECT':
        return '💬';
      default:
        return '💬';
    }
  };

  const getLastMessage = (room: ChatRoom) => {
    if (!room.messages || room.messages.length === 0) {
      return 'No messages yet';
    }
    const lastMsg = room.messages[0];
    return `${lastMsg.sender.firstName}: ${lastMsg.content.substring(0, 30)}${
      lastMsg.content.length > 30 ? '...' : ''
    }`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <h3>Chats</h3>
      </div>

      <div className="chat-room-list">
        {rooms.length === 0 ? (
          <div className="empty-rooms">
            <span className="empty-icon">💬</span>
            <p>No chat rooms yet</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              className={`chat-room-item ${selectedRoomId === room.id ? 'active' : ''}`}
              onClick={() => onSelectRoom(room.id)}
            >
              <div className="room-icon">{getRoomIcon(room.type)}</div>
              <div className="room-info">
                <div className="room-header">
                  <span className="room-name">{room.name}</span>
                  {room.messages && room.messages.length > 0 && (
                    <span className="room-time">
                      {formatTime(room.messages[0].createdAt)}
                    </span>
                  )}
                </div>
                <div className="room-last-message">{getLastMessage(room)}</div>
                {room.type === 'PROJECT' && room.project && (
                  <Badge variant="default" size="sm" className="room-badge">
                    {room.project.name}
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
