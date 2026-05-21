import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '../utils/api';

const SOCKET_URL = import.meta.env.VITE_API_URL;

class SocketService {
  private socket: Socket | null = null;

  /**
   * Connect to the /chat namespace.
   * Always disconnects any existing socket first so a fresh connection
   * is made with the current user's token — prevents stale-socket bugs
   * after logout/login cycles.
   */
  connect(userId: string, userRole?: string): Socket {
    // Always tear down the old socket before creating a new one.
    // The old guard `if (this.socket?.connected) return this.socket` was
    // the root cause of the "userId not provided" error: after a logout/login
    // the old socket was still marked connected, so the new userId was never sent.
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const token = getAccessToken();

    this.socket = io(`${SOCKET_URL}/chat`, {
      // Pass JWT in auth (preferred, secure) AND keep userId/userRole in query
      // for backward compatibility with chat.gateway.ts room membership checks.
      auth: token ? { token } : undefined,
      query: {
        userId,
        userRole: userRole || 'EMPLOYEE',
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('[Chat] Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('[Chat] Socket disconnected');
    });

    this.socket.on('error', (error: any) => {
      console.error('[Chat] Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  joinRoom(roomId: string, userId: string, callback?: (res: any) => void) {
    if (callback) {
      this.socket?.emit('joinRoom', { roomId, userId }, callback);
    } else {
      this.socket?.emit('joinRoom', { roomId, userId });
    }
  }

  leaveRoom(roomId: string, userId: string) {
    this.socket?.emit('leaveRoom', { roomId, userId });
  }

  sendMessage(roomId: string, content: string, userId: string) {
    this.socket?.emit('sendMessage', { roomId, content, userId });
  }

  editMessage(messageId: string, content: string, userId: string) {
    this.socket?.emit('editMessage', { messageId, content, userId });
  }

  deleteMessage(messageId: string, userId: string) {
    this.socket?.emit('deleteMessage', { messageId, userId });
  }

  sendTyping(roomId: string, userId: string, isTyping: boolean) {
    this.socket?.emit('typing', { roomId, userId, isTyping });
  }

  onReceiveMessage(callback: (message: any) => void) {
    this.socket?.on('receiveMessage', callback);
  }

  onMessageEdited(callback: (message: any) => void) {
    this.socket?.on('messageEdited', callback);
  }

  onMessageDeleted(callback: (data: { messageId: string }) => void) {
    this.socket?.on('messageDeleted', callback);
  }

  onTypingIndicator(callback: (data: any) => void) {
    this.socket?.on('typingIndicator', callback);
  }

  onUserJoined(callback: (data: any) => void) {
    this.socket?.on('userJoined', callback);
  }

  onUserLeft(callback: (data: any) => void) {
    this.socket?.on('userLeft', callback);
  }

  offReceiveMessage() {
    this.socket?.off('receiveMessage');
  }

  offMessageEdited() {
    this.socket?.off('messageEdited');
  }

  offMessageDeleted() {
    this.socket?.off('messageDeleted');
  }

  offTypingIndicator() {
    this.socket?.off('typingIndicator');
  }

  offUserJoined() {
    this.socket?.off('userJoined');
  }

  offUserLeft() {
    this.socket?.off('userLeft');
  }
}

export const socketService = new SocketService();
