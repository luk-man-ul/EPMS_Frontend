import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { socketService } from '../../services/socket';
import { ChatSidebar, ChatRoom } from '../../components/chat';
import type { ChatRoom as ChatRoomType } from '../../components/chat/types';
import { Card, LoadingSpinner, ErrorMessage } from '../../components/ui';
import api from '../../utils/api';
import './ChatPage.css';

export default function ChatPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoomType[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Connect socket with user role
      socketService.connect(user.id, user.role);

      // Load rooms
      loadRooms();
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/chat/rooms');
      const loadedRooms = response.data || [];
      setRooms(loadedRooms);

      // Auto-select first room if available and no room is currently selected
      if (loadedRooms.length > 0 && !selectedRoomId) {
        setSelectedRoomId(loadedRooms[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load chat rooms:', err);
      setError(err.response?.data?.message || 'Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);

  if (loading) {
    return (
      <Card>
        <LoadingSpinner text="Loading chat..." />
      </Card>
    );
  }

  if (error) {
    return <ErrorMessage type="page" message={error} />;
  }

  return (
    <div className="chat-page">
      <Card padding="none" className="chat-container">
        <div className="chat-layout">
          <ChatSidebar
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={handleSelectRoom}
          />

          <div className="chat-main">
            {selectedRoom ? (
              <ChatRoom roomId={selectedRoom.id} roomName={selectedRoom.name} />
            ) : (
              <div className="no-room-selected">
                <span className="empty-icon">💬</span>
                <p>Select a chat room to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
