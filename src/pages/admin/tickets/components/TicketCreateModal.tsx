import { useEffect, useState } from 'react'
import { createTicket } from '../tickets.api'
import { getProjectsForDropdown } from '../projects.api'
import api from '../../../../utils/api'
import type { Ticket } from '../types/ticket.types'

interface Props {
  ticket?: Ticket | null
  onClose: () => void
  onSuccess: () => void
}

interface ProjectOption {
  id: string
  name: string
}

const TicketCreateModal = ({ ticket, onClose, onSuccess }: Props) => {
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
  // Prefill form when editing
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title || '')
      setDescription(ticket.description || '')
      setType(ticket.type || 'SUPPORT')
      setPriority(ticket.priority || 'MEDIUM')
      setProjectId(ticket.project?.id || '')
    }
  }, [ticket])

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

      if (ticket) {
        // Update existing ticket
        await api.patch(`/tickets/${ticket.id}`, {
          projectId,
          title,
          description,
          type,
          priority,
        })
      } else {
        // Create new ticket
        await createTicket({
          projectId,
          title,
          description,
          type,
          priority,
        })
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(
        err?.response?.data?.message || `Failed to ${ticket ? 'update' : 'create'} ticket`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 600, 
          marginBottom: '24px',
          color: '#1a1a1a'
        }}>
          {ticket ? 'Edit Ticket' : 'Create New Ticket'}
        </h2>

        {error && (
          <div style={{ 
            color: '#dc2626', 
            backgroundColor: '#fee2e2',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        {/* Project Selection */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Project *</label>
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
          <label style={labelStyle}>Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the issue"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide detailed information about the ticket..."
            style={{ ...inputStyle, height: 120, resize: 'vertical' as const }}
          />
        </div>

        {/* Type and Priority Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Type */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Type</label>
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
            <label style={labelStyle}>Priority</label>
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
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid #f5f5f5'
        }}>
          <button onClick={onClose} style={secondaryButton}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...primaryButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (ticket ? 'Updating...' : 'Creating...') : (ticket ? 'Update Ticket' : 'Create Ticket')}
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
  padding: '32px',
  borderRadius: '12px',
  width: '520px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
}

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '20px',
}

const labelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 500,
  color: '#1a1a1a',
  marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #e5e5e5',
  fontSize: '14px',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s ease',
  outline: 'none',
}

const primaryButton: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#1a1a1a',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
  transition: 'all 0.15s ease',
}

const secondaryButton: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#fff',
  color: '#1a1a1a',
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
  transition: 'all 0.15s ease',
}