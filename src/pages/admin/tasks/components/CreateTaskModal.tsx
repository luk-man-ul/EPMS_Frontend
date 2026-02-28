import type { Task } from '../../../shared/tasks/types/task.types'
import TaskForm from '../../../shared/tasks/TaskForm'

interface Props {
  isOpen: boolean
  task?: Task | null
  onClose: () => void
  onCreated: () => void
}

const CreateTaskModal = ({
  isOpen,
  task,
  onClose,
  onCreated,
}: Props) => {
  if (!isOpen) return null

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            {task ? 'Edit Task' : 'Create Task'}
          </h2>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          <TaskForm
            task={task}
            loadAllProjects={true}   // ✅ Admin loads all projects
            onSuccess={() => {
              onCreated()
              onClose()
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  )
}

////////////////////////////////////////////////////////////
// STYLES
////////////////////////////////////////////////////////////

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
}

const modalStyle: React.CSSProperties = {
  width: 600,
  maxHeight: '90vh',
  overflowY: 'auto',
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  display: 'flex',
  flexDirection: 'column',
}

const headerStyle: React.CSSProperties = {
  padding: '24px 28px',
  borderBottom: '1px solid #f0f0f0',
}

const bodyStyle: React.CSSProperties = {
  padding: '24px 28px',
}

export default CreateTaskModal