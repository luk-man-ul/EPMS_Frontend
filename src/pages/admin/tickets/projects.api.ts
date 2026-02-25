import api from '../../../utils/api'

export interface ProjectOption {
  id: string
  name: string
}

export const getProjectsForDropdown = async (): Promise<ProjectOption[]> => {
  const response = await api.get('/projects', {
    params: { page: 1, limit: 100 },
  })

  return response.data.data.map((project: any) => ({
    id: project.id,
    name: project.name,
  }))
}