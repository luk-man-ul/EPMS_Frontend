import api from '../../../utils/api'

export interface EmployeeOption {
  id: string
  name: string
}

export const getEmployeesForDropdown = async (): Promise<EmployeeOption[]> => {
  const response = await api.get('/users', {
    params: { page: 1, limit: 100 },
  })

  // 🔥 response.data is already an array
  const users = response.data

  return users
    .filter((user: any) => user.roles.some((r: any) => r.role.name === 'EMPLOYEE'))
    .filter((user: any) => user.status === 'ACTIVE') // optional safety
    .map((user: any) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
    }))
}