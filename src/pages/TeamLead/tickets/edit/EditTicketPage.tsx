import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../../utils/api'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import { TicketType, Priority, getEnumOptions } from '../../../../types/enums'

const EditTicketPage = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: TicketType.BUG,
    priority: Priority.MEDIUM,
  })

  ////////////////////////////////////////////////////////////////
  // FETCH TICKET
  ////////////////////////////////////////////////////////////////

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await api.get(`/tickets/${ticketId}`)
        const ticket = res.data

        // Check if user is the reporter
        if (ticket.reporterId !== user?.id) {
          showToast('error', 'You can only edit your own tickets')
          navigate('/app/tickets')
          return
        }

        setForm({
          title: ticket.title,
          description: ticket.description,
          type: ticket.type,
          priority: ticket.priority,
        })
      } catch (err: any) {
        showToast('error', err.response?.data?.message || 'Failed to load ticket')
        navigate('/app/tickets')
      } finally {
        setLoading(false)
      }
    }

    if (ticketId) fetchTicket()
  }, [ticketId, user?.id, navigate])

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

    if (!form.title || !form.description) {
      showToast('error', 'Title and description are required')
      return
    }

    try {
      setUpdating(true)

      await api.patch(`/tickets/${ticketId}`, form)

      showToast('success', 'Ticket updated successfully')
      navigate(`/app/tickets/${ticketId}`)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update ticket'
      showToast('error', errorMessage)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ maxWidth: 700 }}>
      <button
        onClick={() => navigate('/app/tickets')}
        style={{
          background: 'none',
          border: 'none',
          color: '#666666',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '24px',
        }}
      >
        ← Back to Tickets
      </button>

      <h1 style={{ marginBottom: 20 }}>Edit Ticket</h1>

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

        {/* Type */}
        <div style={{ marginBottom: 16 }}>
          <label>Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            style={{ width: '100%', padding: 8 }}
          >
            {getEnumOptions(TicketType).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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
            {getEnumOptions(Priority).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={updating}
          style={{
            padding: '10px 20px',
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          {updating ? 'Updating...' : 'Update Ticket'}
        </button>
      </form>
    </div>
  )
}

export default EditTicketPage
