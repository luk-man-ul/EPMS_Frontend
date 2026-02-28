import { useNavigate } from 'react-router-dom'
import TaskForm from '../../../shared/tasks/TaskForm'

const CreateTaskPage = () => {
  const navigate = useNavigate()

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>
          Create Task
        </h1>

        <TaskForm
          onSuccess={() => navigate('/app/tasks')}
          onCancel={() => navigate('/app/tasks')}
        />
      </div>
    </div>
  )
}

export default CreateTaskPage