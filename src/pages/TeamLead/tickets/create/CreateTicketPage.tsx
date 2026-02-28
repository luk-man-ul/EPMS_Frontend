import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../../utils/api'
import { useAuth } from '../../../../context/AuthContext'

const CreateTicketPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [projects, setProjects] = useState<any[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [creating, setCreating] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'BUG',
    priority: 'MEDIUM',
    projectId: '',
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
        alert('Failed to load projects')
      } finally {
        setLoadingProjects(false)
      }
    }

    fetchProjects()
  }, [])

  ////////////////////////////////////////////////////////////////
  // HANDLE CHANGE
  ////////////////////////////////////////////////////////////////

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  ////////////////////////////////////////////////////////////////
  // SUBMIT
  ////////////////////////////////////////////////////////////////

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!form.title || !form.description || !form.projectId) {
      alert('All fields are required')
      return
    }

    try {
      setCreating(true)

      const res = await api.post('/tickets', form)

      navigate(`/app/tickets/${res.data.id}`)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create ticket')
    } finally {
      setCreating(false)
    }
  }

  if (loadingProjects) return <div>Loading...</div>

  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ marginBottom: 20 }}>Create Ticket</h1>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <label>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        {/* Project */}
        <div style={{ marginBottom: 16 }}>
          <label>Project</label>
          <select
            name="projectId"
            value={form.projectId}
            onChange={handleChange}
            style={{ width: '100%', padding: 8 }}
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div style={{ marginBottom: 16 }}>
          <label>Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            style={{ width: '100%', padding: 8 }}
          >
            <option value="BUG">Bug</option>
            <option value="FEATURE">Feature</option>
            <option value="SUPPORT">Support</option>
            <option value="INCIDENT">Incident</option>
          </select>
        </div>

        {/* Priority */}
        <div style={{ marginBottom: 16 }}>
          <label>Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            style={{ width: '100%', padding: 8 }}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={creating}
          style={{
            padding: '10px 20px',
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          {creating ? 'Creating...' : 'Create Ticket'}
        </button>
      </form>
    </div>
  )
}

export default CreateTicketPage