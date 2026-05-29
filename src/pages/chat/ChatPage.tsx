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
    // Guard: do not connect until we have a real user id
    if (!user?.id) return;

    // Connect socket — socketService.connect() always tears down any
    // existing socket first, so this is safe to call on every mount.
    socketService.connect(user.id, user.role);

    // Load rooms after socket is initialised
    loadRooms();

    return () => {
      socketService.disconnect();
    };
  // Depend only on the primitive user id, NOT the full user object.
  // Using the full object causes the effect to re-run (disconnect + reconnect)
  // whenever AuthContext produces a new object reference, even if the user
  // identity hasn't changed — which is the root cause of the disconnect loop.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/chat/rooms');
      const loadedRooms = response.data || [];
      setRooms(loadedRooms);

      // Auto-select first room if available and no room is currently selected (desktop only)
      if (loadedRooms.length > 0 && !selectedRoomId && window.innerWidth > 768) {
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
        <div className={`chat-layout${selectedRoomId ? ' room-selected' : ''}`}>
          <ChatSidebar
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={handleSelectRoom}
          />

          <div className="chat-main">
            {selectedRoom ? (
              <ChatRoom
                roomId={selectedRoom.id}
                roomName={selectedRoom.name}
                onBack={() => setSelectedRoomId(null)}
              />
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
