import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string, userRole?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(`${SOCKET_URL}/chat`, {
      query: { 
        userId,
        userRole: userRole || 'EMPLOYEE'
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
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

  sendTyping(roomId: string, userId: string, isTyping: boolean) {
    this.socket?.emit('typing', { roomId, userId, isTyping });
  }

  onReceiveMessage(callback: (message: any) => void) {
    this.socket?.on('receiveMessage', callback);
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
