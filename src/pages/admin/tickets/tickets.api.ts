import api from '../../../utils/api'
import type { PaginatedTickets } from './types/ticket.types'

export interface TicketQueryParams {
  status?: string
  priority?: string
  projectId?: string
  page?: number
  limit?: number
}

export const getTickets = async (
  params?: TicketQueryParams
): Promise<PaginatedTickets> => {
  const response = await api.get('/tickets', { params })
  return response.data
}

export const createTicket = async (data: {
  title: string
  description: string
  type: string
  priority?: string
  projectId?: string
}) => {
  const response = await api.post('/tickets', data)
  return response.data
}

export const updateTicketStatus = async (
  id: string,
  status: string,
  resolution?: string
) => {
  const response = await api.patch(`/tickets/${id}/status`, {
    status,
    resolution,
  })
  return response.data
}

export const assignTicket = async (id: string, assignedToId: string) => {
  const response = await api.patch(`/tickets/${id}/assign`, {
    assignedToId,
  })
  return response.data
}

export const updateTicketPriority = async (
  id: string,
  priority: string
) => {
  const response = await api.patch(`/tickets/${id}/priority`, {
    priority,
  })
  return response.data
}

export const deleteTicket = async (id: string) => {
  const response = await api.delete(`/tickets/${id}`)
  return response.data
}