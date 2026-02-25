import { useEffect, useState } from 'react'
import api from '../../../../utils/api'
import type { Task } from '../types/task.types'

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
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    projectId: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedToId: '',
    dueDate: '',
  })

  ////////////////////////////////////////////////////////////
  // LOAD DATA
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!isOpen) return

    const fetchData = async () => {
      try {
        const [projectRes, userRes] = await Promise.all([
          api.get('/projects'),
          api.get('/users'),
        ])

        setProjects(projectRes.data.data || [])
        setUsers(userRes.data || [])
      } catch (err) {
        console.error('Failed to load modal data', err)
      }
    }

    fetchData()
  }, [isOpen])

  ////////////////////////////////////////////////////////////
  // PREFILL WHEN EDITING
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!task) {
      // reset form for create
      setForm({
        projectId: '',
        title: '',
        description: '',
        priority: 'MEDIUM',
        assignedToId: '',
        dueDate: '',
      })
      return
    }

    setForm({
      projectId: task.project?.id || '',
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'MEDIUM',
      assignedToId: task.assignee?.id || '',
      dueDate: task.dueDate
        ? task.dueDate.slice(0, 10)
        : '',
    })
  }, [task])

  ////////////////////////////////////////////////////////////
  // HANDLE CHANGE
  ////////////////////////////////////////////////////////////

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  ////////////////////////////////////////////////////////////
  // SUBMIT
  ////////////////////////////////////////////////////////////

  const handleSubmit = async () => {
    if (!form.projectId || !form.title.trim()) {
      alert('Project and Title are required')
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
        // 🔥 EDIT MODE
        await api.patch(`/tasks/${task.id}`, payload)
      } else {
        // 🔥 CREATE MODE
        await api.post('/tasks', payload)
      }

      onCreated()
      onClose()
    } catch (err) {
      console.error('Task save failed', err)
    } finally {
      setLoading(false)
    }
  }

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
          <FormField label="Project *">
            <select
              style={inputStyle}
              value={form.projectId}
              onChange={(e) =>
                handleChange('projectId', e.target.value)
              }
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Title *">
            <input
              style={inputStyle}
              type="text"
              value={form.title}
              onChange={(e) =>
                handleChange('title', e.target.value)
              }
            />
          </FormField>

          <FormField label="Description">
            <textarea
              style={{ ...inputStyle, height: 90, resize: 'none' }}
              value={form.description}
              onChange={(e) =>
                handleChange('description', e.target.value)
              }
            />
          </FormField>

          <div style={{ display: 'flex', gap: 16 }}>
            <FormField label="Priority" style={{ flex: 1 }}>
              <select
                style={inputStyle}
                value={form.priority}
                onChange={(e) =>
                  handleChange('priority', e.target.value)
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </FormField>

            <FormField label="Due Date" style={{ flex: 1 }}>
              <input
                style={inputStyle}
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  handleChange('dueDate', e.target.value)
                }
              />
            </FormField>
          </div>

          <FormField label="Assign To">
            <select
              style={inputStyle}
              value={form.assignedToId}
              onChange={(e) =>
                handleChange('assignedToId', e.target.value)
              }
            >
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <button style={secondaryButton} onClick={onClose}>
            Cancel
          </button>
          <button
            style={primaryButton}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? task
                ? 'Updating...'
                : 'Creating...'
              : task
              ? 'Update Task'
              : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

////////////////////////////////////////////////////////////
// SMALL REUSABLE FIELD COMPONENT
////////////////////////////////////////////////////////////

const FormField = ({
  label,
  children,
  style,
}: {
  label: string
  children: React.ReactNode
  style?: React.CSSProperties
}) => (
  <div style={{ marginBottom: 20, ...style }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 6,
        display: 'block',
        color: '#444',
      }}
    >
      {label}
    </label>
    {children}
  </div>
)

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
  width: 560,
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

const headerStyle: React.CSSProperties = {
  padding: '24px 28px',
  borderBottom: '1px solid #f0f0f0',
}

const bodyStyle: React.CSSProperties = {
  padding: '24px 28px',
}

const footerStyle: React.CSSProperties = {
  padding: '20px 28px',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 12,
  borderTop: '1px solid #f0f0f0',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #ddd',
  fontSize: 14,
  outline: 'none',
}

const primaryButton: React.CSSProperties = {
  padding: '10px 18px',
  borderRadius: 8,
  border: 'none',
  background: '#111',
  color: '#fff',
  fontWeight: 500,
  cursor: 'pointer',
}

const secondaryButton: React.CSSProperties = {
  padding: '10px 18px',
  borderRadius: 8,
  border: '1px solid #ddd',
  background: '#fff',
  cursor: 'pointer',
}

export default CreateTaskModal