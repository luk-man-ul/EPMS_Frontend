import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { socketService } from '../../services/socket';
import type { ChatMessage } from './types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { Card, LoadingSpinner } from '../ui';
import api from '../../utils/api';
import './ChatRoom.css';

interface ChatRoomProps {
  roomId: string;
  roomName: string;
}

export function ChatRoom({ roomId, roomName }: ChatRoomProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !roomId) return;

    // Load message history
    loadMessages();

    // Connect socket and join room
    const socket = socketService.getSocket();
    if (socket) {
      socketService.joinRoom(roomId, user.id, (response) => {
        if (response && !response.success) {
          console.error('Failed to join room:', response.error);
        }
      });

      // Listen for new messages
      socketService.onReceiveMessage((message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });

      // Listen for edited messages
      socketService.onMessageEdited((updatedMessage: ChatMessage) => {
        setMessages((prev) => {
          if (!prev.some((m) => m.id === updatedMessage.id)) return prev;
          return prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m));
        });
      });

      // Listen for deleted messages
      socketService.onMessageDeleted(({ messageId }: { messageId: string }) => {
        setMessages((prev) => {
          if (!prev.some((m) => m.id === messageId)) return prev;
          return prev.map((m) => (m.id === messageId ? { ...m, isDeleted: true } : m));
        });
      });

      // Listen for typing indicators
      socketService.onTypingIndicator((data: any) => {
        if (data.isTyping) {
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.set(data.userId, data.userId);
            return newMap;
          });

          // Remove typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers((prev) => {
              const newMap = new Map(prev);
              newMap.delete(data.userId);
              return newMap;
            });
          }, 3000);
        } else {
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.delete(data.userId);
            return newMap;
          });
        }
      });
    }

    return () => {
      if (user) {
        socketService.leaveRoom(roomId, user.id);
      }
      socketService.offReceiveMessage();
      socketService.offMessageEdited();
      socketService.offMessageDeleted();
      socketService.offTypingIndicator();
    };
  }, [roomId, user]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      setMessages(response.data || []);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (content: string) => {
    if (user) {
      socketService.sendMessage(roomId, content, user.id);
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (user) {
      let snapshot: ChatMessage[] = [];
      setMessages((prev) => {
        snapshot = prev;
        return prev.map((m) =>
          m.id === messageId ? { ...m, content: newContent } : m
        );
      });
      try {
        socketService.editMessage(messageId, newContent, user.id);
      } catch {
        setMessages(snapshot);
      }
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (user) {
      let snapshot: ChatMessage[] = [];
      setMessages((prev) => {
        snapshot = prev;
        return prev.map((m) =>
          m.id === messageId ? { ...m, isDeleted: true } : m
        );
      });
      try {
        socketService.deleteMessage(messageId, user.id);
      } catch {
        setMessages(snapshot);
      }
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (user) {
      socketService.sendTyping(roomId, user.id, isTyping);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const typingUserNames = Array.from(typingUsers.keys())
    .filter((userId) => userId !== user?.id)
    .map((userId) => {
      const message = messages.find((m) => m.senderId === userId);
      return message ? message.sender.firstName : 'Someone';
    });

  if (loading) {
    return (
      <Card padding="md" className="chat-room-container">
        <div className="chat-room-loading">
          <LoadingSpinner text="Loading messages..." />
        </div>
      </Card>
    );
  }

  return (
    <div className="chat-room-container">
      <div className="chat-room-header">
        <h3>{roomName}</h3>
      </div>

      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <span className="empty-icon">💬</span>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === user?.id}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {typingUserNames.length > 0 && <TypingIndicator userNames={typingUserNames} />}

      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={!user}
      />
    </div>
  );
}
