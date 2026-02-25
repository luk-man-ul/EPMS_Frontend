import { useEffect, useState } from 'react'
import { createTicket } from '../tickets.api'
import { getProjectsForDropdown } from '../projects.api'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

interface ProjectOption {
  id: string
  name: string
}

const TicketCreateModal = ({ onClose, onSuccess }: Props) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('SUPPORT')
  const [priority, setPriority] = useState('MEDIUM')
  const [projectId, setProjectId] = useState('')
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  ////////////////////////////////////////////////////////////
  // Load Projects for Dropdown
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getProjectsForDropdown()
        setProjects(data)
      } catch (err) {
        console.error('Failed to load projects', err)
        setError('Failed to load projects')
      }
    }

    loadProjects()
  }, [])

  ////////////////////////////////////////////////////////////
  // Submit Handler
  ////////////////////////////////////////////////////////////

  const handleSubmit = async () => {
    if (!projectId || !title || !description) {
      setError('Project, title and description are required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      await createTicket({
        projectId,
        title,
        description,
        type,
        priority,
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Failed to create ticket'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginBottom: 20 }}>Create Ticket</h2>

        {error && (
          <div style={{ color: 'red', marginBottom: 12 }}>
            {error}
          </div>
        )}

        {/* Project Selection */}
        <div style={fieldStyle}>
          <label>Project *</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div style={fieldStyle}>
          <label>Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div style={fieldStyle}>
          <label>Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, height: 100 }}
          />
        </div>

        {/* Type */}
        <div style={fieldStyle}>
          <label>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={inputStyle}
          >
            <option value="SUPPORT">Support</option>
            <option value="BUG">Bug</option>
            <option value="FEATURE">Feature</option>
            <option value="IMPROVEMENT">Improvement</option>
          </select>
        </div>

        {/* Priority */}
        <div style={fieldStyle}>
          <label>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={inputStyle}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={secondaryButton}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={primaryButton}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketCreateModal

//////////////////////////////////////////////////////////
// STYLES
//////////////////////////////////////////////////////////

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
}

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: 24,
  borderRadius: 12,
  width: 420,
}

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: 14,
}

const inputStyle: React.CSSProperties = {
  padding: 8,
  borderRadius: 6,
  border: '1px solid #ddd',
  marginTop: 4,
}

const primaryButton: React.CSSProperties = {
  padding: '8px 14px',
  backgroundColor: '#1a1a1a',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
}

const secondaryButton: React.CSSProperties = {
  padding: '8px 14px',
  backgroundColor: '#eee',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
}