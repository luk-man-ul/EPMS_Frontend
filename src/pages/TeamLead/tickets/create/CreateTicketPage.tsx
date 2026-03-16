import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../../../utils/api'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import { TicketType, Priority, getEnumOptions } from '../../../../types/enums'

const CreateTicketPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { showToast } = useToast()

  const defaultProjectId = location.state?.defaultProjectId || ''

  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [projectMembers, setProjectMembers] = useState<any[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [creating, setCreating] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: TicketType.BUG,
    priority: Priority.MEDIUM,
    projectId: defaultProjectId,
    taskId: '',
    assignedToId: '',
  })

  ////////////////////////////////////////////////////////////////
  // FETCH MY PROJECTS
  ////////////////////////////////////////////////////////////////

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects/my')
        setProjects(res.data)
      } catch (err) {
        showToast('error', 'Failed to load projects')
      } finally {
        setLoadingProjects(false)
      }
    }

    fetchProjects()
  }, [])

  ////////////////////////////////////////////////////////////////
  // FETCH TASKS AND MEMBERS WHEN PROJECT CHANGES
  ////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!form.projectId) {
      setTasks([])
      setProjectMembers([])
      return
    }

    const fetchProjectData = async () => {
      try {
        setLoadingTasks(true)

        const tasksRes = await api.get('/tasks', {
          params: { projectId: form.projectId }
        })
        setTasks(tasksRes.data.data || [])

        const selectedProject = projects.find(p => p.id === form.projectId)
        if (selectedProject?.members) {
          setProjectMembers(selectedProject.members)
        } else {
          const projectRes = await api.get(`/projects/${form.projectId}`)
          setProjectMembers(projectRes.data.members || [])
        }
      } catch (err) {
        showToast('error', 'Failed to load project data')
      } finally {
        setLoadingTasks(false)
      }
    }

    fetchProjectData()
  }, [form.projectId, projects])

  ////////////////////////////////////////////////////////////////
  // HANDLE CHANGE
  ////////////////////////////////////////////////////////////////

  const handleChange = (e: any) => {
    const { name, value } = e.target

    setForm({
      ...form,
      [name]: value,
      ...(name === 'projectId' && { taskId: '', assignedToId: '' })
    })
  }

  ////////////////////////////////////////////////////////////////
  // SUBMIT
  ////////////////////////////////////////////////////////////////

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!form.title || !form.description || !form.projectId) {
      showToast('error', 'Title, description, and project are required')
      return
    }

    try {
      setCreating(true)

      const payload: any = {
        title: form.title,
        description: form.description,
        type: form.type,
        priority: form.priority,
        projectId: form.projectId,
      }

      if (form.taskId) payload.taskId = form.taskId
      if (form.assignedToId) payload.assignedToId = form.assignedToId

      const res = await api.post('/tickets', payload)

      showToast('success', 'Ticket created successfully')
      if (defaultProjectId) {
        navigate(`/app/projects/${defaultProjectId}?tab=tickets`)
      } else {
        navigate(`/app/tickets/${res.data.id}`)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create ticket'
      showToast('error', errorMessage)
    } finally {
      setCreating(false)
    }
  }

  if (loadingProjects) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
        Loading projects...
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={() => {
          if (defaultProjectId) {
            navigate(`/app/projects/${defaultProjectId}?tab=tickets`)
          } else {
            navigate(-1)
          }
        }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '14px', marginBottom: '20px', padding: 0 }}
      >
        ← Back
      </button>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>
          Create New Ticket
        </h1>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Report an issue or request support for your project
        </p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '32px' }}>
        <form onSubmit={handleSubmit}>
          {/* Project Selection */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Project *</label>
            {defaultProjectId ? (
              <input
                value={projects.find(p => p.id === defaultProjectId)?.name || 'Loading...'}
                disabled
                style={{ ...inputStyle, background: '#f5f5f5', color: '#666', cursor: 'not-allowed' }}
              />
            ) : (
              <select name="projectId" value={form.projectId} onChange={handleChange} style={inputStyle} required>
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Task Selection */}
          {form.projectId && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Task (Optional)</label>
              <select name="taskId" value={form.taskId} onChange={handleChange} style={inputStyle} disabled={loadingTasks}>
                <option value="">No task</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Assignee */}
          {form.projectId && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Assign To (Optional)</label>
              <select name="assignedToId" value={form.assignedToId} onChange={handleChange} style={inputStyle} disabled={loadingTasks}>
                <option value="">Unassigned</option>
                <option value={user?.id}>Assign to me</option>
                {projectMembers
                  .filter((member: any) => member.userId !== user?.id)
                  .map((member: any) => (
                    <option key={member.userId} value={member.userId}>
                      {member.user?.firstName} {member.user?.lastName}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Title *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Brief description of the issue" style={inputStyle} required />
          </div>

          {/* Description */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Provide detailed information..." rows={6} style={{ ...inputStyle, resize: 'vertical' as const }} required />
          </div>

          {/* Type and Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Type *</label>
              <select name="type" value={form.type} onChange={handleChange} style={inputStyle} required>
                {getEnumOptions(TicketType).map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Priority *</label>
              <select name="priority" value={form.priority} onChange={handleChange} style={inputStyle} required>
                {getEnumOptions(Priority).map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f5f5f5' }}>
            <button type="button" onClick={() => defaultProjectId ? navigate(`/app/projects/${defaultProjectId}?tab=tickets`) : navigate(-1)} style={secondaryButtonStyle}>
              Cancel
            </button>
            <button type="submit" disabled={creating} style={{ ...primaryButtonStyle, opacity: creating ? 0.6 : 1, cursor: creating ? 'not-allowed' : 'pointer' }}>
              {creating ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const fieldStyle: React.CSSProperties = { marginBottom: '20px' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }
const hintStyle: React.CSSProperties = { fontSize: '12px', color: '#999', marginTop: '4px', display: 'block' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }
const primaryButtonStyle: React.CSSProperties = { padding: '10px 24px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }
const secondaryButtonStyle: React.CSSProperties = { padding: '10px 24px', background: '#fff', color: '#1a1a1a', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }

export default CreateTicketPage
