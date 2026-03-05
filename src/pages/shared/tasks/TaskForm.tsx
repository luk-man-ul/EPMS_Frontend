import { useEffect, useState } from 'react'
import api from '../../../utils/api'
import { createSelfWork } from '../../../utils/api'
import TaskTypeSelector from '../../../components/shared/TaskTypeSelector'
import { TaskType } from '../../../types/enums'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'

interface Props {
  task?: any
  onSuccess: () => void
  onCancel: () => void
  loadAllProjects?: boolean // admin = true
}

const TaskForm = ({
  task,
  onSuccess,
  onCancel,
  loadAllProjects = false,
}: Props) => {
  const { user } = useAuth()
  const { showToast } = useToast()
  
  const [projects, setProjects] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // Task type state - default based on user role
  const [taskType, setTaskType] = useState<TaskType>(
    user?.role === 'EMPLOYEE' ? TaskType.SELF_WORK : TaskType.ASSIGNED
  )

  const [form, setForm] = useState({
    projectId: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedToId: '',
    dueDate: '',
  })

  ////////////////////////////////////////////////////////////////
  // LOAD PROJECTS
  ////////////////////////////////////////////////////////////////

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get(
          loadAllProjects ? '/projects' : '/projects/my'
        )

        setProjects(res.data.data || res.data)
      } catch (err) {
        console.error('Failed to load projects')
      }
    }

    fetchProjects()
  }, [loadAllProjects])

  ////////////////////////////////////////////////////////////////
  // AUTO-SET ASSIGNEE FOR SELF-WORK
  ////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (taskType === TaskType.SELF_WORK && user?.id) {
      setForm((prev) => ({ ...prev, assignedToId: user.id }))
    }
  }, [taskType, user?.id])

  ////////////////////////////////////////////////////////////////
  // LOAD MEMBERS WHEN PROJECT CHANGES
  ////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!form.projectId) {
      setMembers([])
      return
    }

    const fetchMembers = async () => {
      try {
        const res = await api.get(`/projects/${form.projectId}`)
        setMembers(res.data.members || [])
      } catch (err) {
        console.error('Failed to load project members')
      }
    }

    fetchMembers()
  }, [form.projectId])

  ////////////////////////////////////////////////////////////////
  // PREFILL EDIT
  ////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!task) return

    setForm({
      projectId: task.project?.id || '',
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'MEDIUM',
      assignedToId: task.assignee?.id || '',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    })
  }, [task])

  ////////////////////////////////////////////////////////////////
  // CHANGE
  ////////////////////////////////////////////////////////////////

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  ////////////////////////////////////////////////////////////////
  // SUBMIT
  ////////////////////////////////////////////////////////////////

  const handleSubmit = async (e?: any) => {
    e?.preventDefault()

    if (!form.projectId || !form.title.trim()) {
      showToast('error', 'Project and Title are required')
      return
    }

    try {
      setLoading(true)

      const payload = {
        ...form,
        assignedToId: form.assignedToId || null,
        dueDate: form.dueDate || null,
      }

      if (task) {
        // Edit existing task
        await api.patch(`/tasks/${task.id}`, payload)
        showToast('success', 'Task updated successfully')
      } else {
        // Create new task - use appropriate endpoint based on type
        if (taskType === TaskType.SELF_WORK) {
          await createSelfWork({
            projectId: payload.projectId,
            title: payload.title,
            description: payload.description,
            priority: payload.priority,
            dueDate: payload.dueDate || undefined,
          })
          showToast('success', 'Self-work proposal submitted for approval')
        } else {
          await api.post('/tasks', payload)
          showToast('success', 'Task created successfully')
        }
      }

      onSuccess()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Task save failed'
      showToast('error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  ////////////////////////////////////////////////////////////////

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {/* Task Type Selector - only show for new tasks, not edits */}
      {!task && user && (
        <TaskTypeSelector
          value={taskType}
          onChange={setTaskType}
          userRole={user.role}
        />
      )}

      <FormField label="Project *">
        <select
          value={form.projectId}
          onChange={(e) =>
            handleChange('projectId', e.target.value)
          }
          style={inputStyle}
        >
          <option value="">Select Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Title *">
        <input
          value={form.title}
          onChange={(e) =>
            handleChange('title', e.target.value)
          }
          style={inputStyle}
        />
      </FormField>

      <FormField label="Description">
        <textarea
          value={form.description}
          onChange={(e) =>
            handleChange('description', e.target.value)
          }
          style={{ ...inputStyle, height: 90 }}
        />
      </FormField>

      <div style={{ display: 'flex', gap: 16 }}>
        <FormField label="Priority" style={{ flex: 1 }}>
          <select
            value={form.priority}
            onChange={(e) =>
              handleChange('priority', e.target.value)
            }
            style={inputStyle}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </FormField>

        <FormField label="Due Date" style={{ flex: 1 }}>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) =>
              handleChange('dueDate', e.target.value)
            }
            style={inputStyle}
          />
        </FormField>
      </div>

      <FormField label="Assign To">
        <select
          value={form.assignedToId}
          onChange={(e) =>
            handleChange('assignedToId', e.target.value)
          }
          style={inputStyle}
          disabled={taskType === TaskType.SELF_WORK}
        >
          <option value="">Select Member</option>
          {members.map((m: any) => (
            <option key={m.user.id} value={m.user.id}>
              {m.user.firstName} {m.user.lastName}
            </option>
          ))}
        </select>
      </FormField>

      {/* Info message for self-work */}
      {taskType === TaskType.SELF_WORK && (
        <div
          style={{
            padding: '12px 16px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 8,
            fontSize: 13,
            color: '#1e40af',
            marginTop: -10,
          }}
        >
          ℹ️ This task will be assigned to you after approval
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button type="button" onClick={onCancel} style={secondaryBtn}>
          Cancel
        </button>
        <button type="submit" disabled={loading} style={primaryBtn}>
          {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}

////////////////////////////////////////////////////////////

const FormField = ({ label, children, style }: any) => (
  <div style={{ marginBottom: 10, ...style }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 6,
        display: 'block',
      }}
    >
      {label}
    </label>
    {children}
  </div>
)

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
}

const primaryBtn: React.CSSProperties = {
  padding: '10px 16px',
  background: '#111827',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
}

const secondaryBtn: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  background: '#fff',
  cursor: 'pointer',
}

export default TaskForm