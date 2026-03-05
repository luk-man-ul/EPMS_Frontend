import type { Task, TaskStatus } from '../types/task.types'
import TaskRow from './TaskRow'

interface Props {
  tasks: Task[]
  loading: boolean
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onEdit: (taskId: string) => void
  onDelete: (taskId: string) => void
}

const TaskTable = ({
  tasks,
  loading,
  onStatusChange,
  onEdit,
  onDelete,
}: Props) => {
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        Loading tasks...
      </div>
    )
  }

  if (!tasks.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        No tasks found
      </div>
    )
  }

  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
      }}
    >
      <thead>
        <tr
          style={{
            textAlign: 'left',
            fontSize: '12px',
            color: '#666',
            fontWeight: 500,
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <th style={{ padding: '16px 20px' }}>Task Title</th>
          <th style={{ padding: '16px 20px' }}>Project</th>
          <th style={{ padding: '16px 20px' }}>Assigned To</th>
          <th style={{ padding: '16px 20px' }}>Type</th>
          <th style={{ padding: '16px 20px' }}>Priority</th>
          <th style={{ padding: '16px 20px' }}>Status</th>
          <th style={{ padding: '16px 20px' }}>Deadline</th>
          <th style={{ padding: '16px 20px', textAlign: 'right' }}>
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  )
}

export default TaskTable