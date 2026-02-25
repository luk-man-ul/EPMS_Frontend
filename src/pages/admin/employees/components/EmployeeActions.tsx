import type { Employee } from '../types/employee.types'
import { getAuthHeaders } from '../../../../utils/auth'

interface Props {
  employee: Employee
  onRefresh: () => void
}


const EmployeeActions = ({ employee, onRefresh }: Props) => {
  const roleNames = employee.roles.map(r => r.role.name)

  const callApi = async (endpoint: string) => {
    await fetch(`http://localhost:3000/users/${employee.id}/${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    })
    onRefresh()
  }

  return (
    <>
      {roleNames.includes('EMPLOYEE') && (
        <button onClick={() => callApi('promote')}>
          Promote
        </button>
      )}

      {roleNames.includes('TEAMLEAD') && (
        <button onClick={() => callApi('demote')}>
          Demote
        </button>
      )}

      <button onClick={() => callApi('deactivate')}>
        Deactivate
      </button>
    </>
  )
}

export default EmployeeActions
