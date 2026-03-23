import type { Employee } from '../types/employee.types'
import api from '../../../../utils/api'

interface Props {
  employee: Employee
  onRefresh: () => void
}

const EmployeeActions = ({ employee, onRefresh }: Props) => {
  const roleNames = employee.roles.map(r => r.role.name)

  const callApi = async (endpoint: string) => {
    await api.patch(`/users/${employee.id}/${endpoint}`)
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
