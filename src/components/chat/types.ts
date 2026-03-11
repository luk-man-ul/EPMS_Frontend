export interface ChatRoom {
  id: string;
  name: string;
  type: 'COMPANY' | 'TEAM' | 'PROJECT' | 'DIRECT';
  projectId?: string;
  members: ChatRoomMember[];
  messages?: ChatMessage[];
  project?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoomMember {
  id: string;
  roomId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhoto?: string;
  };
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhoto?: string;
  };
  createdAt: string;
}
