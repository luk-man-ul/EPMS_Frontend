import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../../../utils/api'

const TaskDetailPage = () => {
  const { taskId } = useParams()
  const navigate = useNavigate()

  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/tasks/${taskId}`)
        setTask(res.data)
      } catch (err) {
        console.error('Failed to load task', err)
      } finally {
        setLoading(false)
      }
    }

    if (taskId) fetchTask()
  }, [taskId])

  if (loading) return <div>Loading...</div>

  if (!task) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Task Not Found</h2>
        <button onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>{task.title}</h1>
      <p>Status: {task.status}</p>
      <p>Priority: {task.priority}</p>
      <p>Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
    </div>
  )
}

export default TaskDetailPage