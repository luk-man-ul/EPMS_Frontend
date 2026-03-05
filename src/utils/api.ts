import axios from 'axios'
import type { Task, SelfWorkMetrics } from '../types/task'
import { TaskType } from '../types/enums'

const api = axios.create({
  baseURL: 'http://localhost:3000',
})

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor (ADD THIS)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// DTO interfaces for self-work operations
export interface CreateSelfWorkDto {
  projectId: string
  title: string
  description: string
  priority?: string
  dueDate?: string
  estimatedHrs?: number
}

export interface RejectSelfWorkDto {
  reason: string
}

export interface TaskFilterParams {
  projectId?: string
  status?: string
  priority?: string
  assignedToId?: string
  type?: TaskType
  page?: number
  limit?: number
}

// Self-Work API Methods

/**
 * Create a self-work task proposal
 * POST /tasks/self-work
 */
export const createSelfWork = async (dto: CreateSelfWorkDto): Promise<Task> => {
  const response = await api.post<Task>('/tasks/self-work', dto)
  return response.data
}

/**
 * Approve a self-work task
 * PATCH /tasks/pending-approvals/:id/approve
 */
export const approveSelfWork = async (taskId: string): Promise<Task> => {
  const response = await api.patch<Task>(`/tasks/pending-approvals/${taskId}/approve`)
  return response.data
}

/**
 * Reject a self-work task
 * PATCH /tasks/pending-approvals/:id/reject
 */
export const rejectSelfWork = async (taskId: string, reason: string): Promise<Task> => {
  const response = await api.patch<Task>(`/tasks/pending-approvals/${taskId}/reject`, { reason })
  return response.data
}

/**
 * Get pending self-work approvals
 * GET /tasks/pending-approvals
 */
export const getPendingApprovals = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('/tasks/pending-approvals')
  return response.data
}

/**
 * Get self-work metrics for a project
 * GET /tasks/self-work-metrics
 */
export const getSelfWorkMetrics = async (projectId?: string): Promise<SelfWorkMetrics> => {
  const params = projectId ? { projectId } : {}
  const response = await api.get<SelfWorkMetrics>('/tasks/self-work-metrics', { params })
  return response.data
}

/**
 * Get tasks with optional filters including type
 * GET /tasks
 */
export const getTasks = async (filters?: TaskFilterParams): Promise<Task[]> => {
  const response = await api.get<Task[]>('/tasks', { params: filters })
  return response.data
}

/**
 * Get a single task by ID
 * GET /tasks/:id
 */
export const getTaskById = async (taskId: string): Promise<Task> => {
  const response = await api.get<Task>(`/tasks/${taskId}`)
  return response.data
}

export default api
