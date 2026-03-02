// Ticket-related TypeScript interfaces

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

export interface TicketStatusHistoryItem {
  id: string
  ticketId: string
  status: string
  changedById: string
  changedBy?: User
  note?: string
  createdAt: string | Date
}

export interface TicketComment {
  id: string
  ticketId: string
  content: string
  authorId: string
  author?: User
  isAdminComment: boolean
  createdAt: string | Date
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: string
  uploadedBy: string
  uploadedAt: string | Date
  url: string
}

export interface Solution {
  id: string
  ticketId: string
  solution: string
  authorId: string
  author?: User
  verified: boolean
  createdAt: string | Date
}
