export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_USER'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'REOPENED'

export type TicketPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT'   // matches backend enum

export type TicketType =
  | 'BUG'
  | 'FEATURE'
  | 'SUPPORT'
  | 'IMPROVEMENT'  // backend enum value

export interface Ticket {
  id: string
  title: string
  description: string
  type: TicketType
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  resolvedAt?: string | null
  closedAt?: string | null

  reporter: {
    id: string
    firstName: string
    lastName: string
  }

  assignee?: {
    id: string
    firstName: string
    lastName: string
  } | null

  project?: {
    id: string
    name: string
  } | null
}

export interface PaginatedTickets {
  data: Ticket[]
  meta: {
    total: number
    page: number
    limit: number
  }
}