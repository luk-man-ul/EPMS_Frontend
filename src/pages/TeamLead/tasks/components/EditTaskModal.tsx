import { useEffect, useState } from 'react'
import api from '../../../../utils/api'
import { useToast } from '../../../../context/ToastContext'

interface Props {
  isOpen: boolean
  task: any
  onClose: () => void
  onSuccess: () => void
}

const EditTaskModal = ({ isOpen, task, onClose, onSuccess }: Props) => {
  const { showToast } = useToast()
  const [projects, setProjects] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    projectId: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedToId: '',
    dueDate: '',
  })

  // Load projects
  useEffect(() => {
    if (!isOpen) return

    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects/my')
        setProjects(res.data.data || res.data)
      } catch (err) {
        console.error('Failed to load projects')
      }
    }

    fetchProjects()
  }, [isOpen])

  // Load members when project changes
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

  // Prefill form when task changes
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

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!form.title.trim()) {
      showToast('error', 'Title is required')
      return
    }

    try {
      setLoading(true)

      const payload = {
        ...form,
        assignedToId: form.assignedToId || null,
        dueDate: form.dueDate || null,
      }

      await api.patch(`/tasks/${task.id}`, payload)
      showToast('success', 'Task updated successfully')
      onSuccess()
      onClose()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            Edit Task
          </h2>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            <FormField label="Project *">
              <select
                value={form.projectId}
                onChange={(e) => handleChange('projectId', e.target.value)}
                style={inputStyle}
                disabled // TEAM_LEAD cannot change project
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
                onChange={(e) => handleChange('title', e.target.value)}
                style={inputStyle}
                required
              />
            </FormField>

            <FormField label="Description">
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                style={{ ...inputStyle, height: 90, fontFamily: 'inherit' }}
              />
            </FormField>

            <div style={{ display: 'flex', gap: 16 }}>
              <FormField label="Priority" style={{ flex: 1 }}>
                <select
                  value={form.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
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
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  style={inputStyle}
                />
              </FormField>
            </div>

            <FormField label="Assign To">
              <select
                value={form.assignedToId}
                onChange={(e) => handleChange('assignedToId', e.target.value)}
                style={inputStyle}
              >
                <option value="">Unassigned</option>
                {members.map((m: any) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.firstName} {m.user.lastName}
                  </option>
                ))}
              </select>
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={onClose} style={secondaryBtn}>
                Cancel
              </button>
              <button type="submit" disabled={loading} style={primaryBtn}>
                {loading ? 'Updating...' : 'Update Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

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
  fontWeight: 600,
}

const secondaryBtn: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  background: '#fff',
  cursor: 'pointer',
  fontWeight: 600,
}

export default EditTaskModal
