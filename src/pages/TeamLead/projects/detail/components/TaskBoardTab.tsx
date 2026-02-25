import { useEffect, useState } from 'react'
import api from '../../../../../utils/api'

interface Props {
  projectId: string
}

const TaskBoardTab = ({ projectId }: Props) => {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks', {
          params: { projectId }
        })
        setTasks(res.data.data ?? res.data)
      } catch (err) {
        console.error('Failed to load tasks', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [projectId])

  if (loading) return <div>Loading tasks...</div>

  const columns = [
    { id: 'TODO', title: 'Todo' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'REVIEW', title: 'Review' },
    { id: 'COMPLETED', title: 'Completed' },
  ]

  const getTasksByStatus = (status: string) =>
    tasks.filter((task) => task.status === status)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id)

        return (
          <div key={column.id} style={{ background: '#fafafa', padding: 16, borderRadius: 12 }}>
            <h3>{column.title} ({columnTasks.length})</h3>

            {columnTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  background: '#fff',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 10,
                  border: '1px solid #e5e5e5'
                }}
              >
                <strong>{task.title}</strong>
                <div style={{ fontSize: 12 }}>{task.priority}</div>
              </div>
            ))}

            {columnTasks.length === 0 && (
              <div style={{ fontSize: 13, color: '#999' }}>
                No tasks
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default TaskBoardTab