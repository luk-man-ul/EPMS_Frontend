import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../../utils/api'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import { TicketType, Priority, getEnumOptions } from '../../../../types/enums'

const CreateTicketPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [projects, setProjects] = useState<any[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [creating, setCreating] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: TicketType.BUG,
    priority: Priority.MEDIUM,
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
        showToast('error', 'Failed to load projects')
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
      showToast('error', 'All fields are required')
      return
    }

    try {
      setCreating(true)

      const res = await api.post('/tickets', form)

      showToast('success', 'Ticket created successfully')
      navigate(`/app/tickets/${res.data.id}`)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create ticket'
      
      // Check for type mismatch errors
      if (errorMessage.includes('type') || errorMessage.includes('priority')) {
        showToast('error', `Type mismatch error: ${errorMessage}`)
      } else {
        showToast('error', errorMessage)
      }
    } finally {
      setCreating(false)
    }
  }

  if (loadingProjects) {
    return (
      <div style={{ 
        padding: '32px', 
        textAlign: 'center',
        fontSize: '14px',
        color: '#666'
      }}>
        Loading projects...
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 700,
          color: '#1a1a1a',
          marginBottom: '8px'
        }}>
          Create New Ticket
        </h1>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Report an issue or request support for your project
        </p>
      </div>

      {/* Form Card */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: '12px',
        padding: '32px'
      }}>
        <form onSubmit={handleSubmit}>
          {/* Project Selection */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Project *</label>
            <select
              name="projectId"
              value={form.projectId}
              onChange={handleChange}
              style={inputStyle}
              required
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <span style={hintStyle}>Choose the project this ticket relates to</span>
          </div>

          {/* Title */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Brief description of the issue"
              style={inputStyle}
              required
            />
            <span style={hintStyle}>Provide a clear, concise title</span>
          </div>

          {/* Description */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Provide detailed information about the ticket..."
              rows={6}
              style={{ ...inputStyle, resize: 'vertical' as const }}
              required
            />
            <span style={hintStyle}>Include steps to reproduce, expected vs actual behavior, or any relevant details</span>
          </div>

          {/* Type and Priority Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Type */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Type *</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                style={inputStyle}
                required
              >
                {getEnumOptions(TicketType).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Priority *</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                style={inputStyle}
                required
              >
                {getEnumOptions(Priority).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #f5f5f5'
          }}>
            <button
              type="button"
              onClick={() => navigate('/app/tickets')}
              style={secondaryButtonStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              style={{
                ...primaryButtonStyle,
                opacity: creating ? 0.6 : 1,
                cursor: creating ? 'not-allowed' : 'pointer'
              }}
            >
              {creating ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

//////////////////////////////////////////////////////////
// STYLES
//////////////////////////////////////////////////////////

const fieldStyle: React.CSSProperties = {
  marginBottom: '24px',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 500,
  color: '#1a1a1a',
  marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.15s ease',
}

const hintStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  color: '#999',
  marginTop: '6px',
}

const primaryButtonStyle: React.CSSProperties = {
  padding: '10px 24px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#fff',
  background: '#1a1a1a',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
}

const secondaryButtonStyle: React.CSSProperties = {
  padding: '10px 24px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#1a1a1a',
  background: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
}

export default CreateTicketPage