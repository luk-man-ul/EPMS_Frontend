/**
 * Shared lookup helpers used by Finance components.
 * Centralises direct api.get('/projects') and api.get('/users') calls.
 */
import api from '../../../utils/api'

export interface ProjectOption {
  id: string
  name: string
}

export interface EmployeeOption {
  id: string
  firstName: string
  lastName: string
}

export const getProjectOptions = async (): Promise<ProjectOption[]> => {
  const res = await api.get('/projects', { params: { page: 1, limit: 100 } })
  const list = res.data.data || res.data || []
  return list.map((p: any) => ({ id: p.id, name: p.name }))
}

export const getEmployeeOptions = async (): Promise<EmployeeOption[]> => {
  const res = await api.get('/users')
  const list = res.data.data || res.data || []
  return list.map((u: any) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName }))
}
