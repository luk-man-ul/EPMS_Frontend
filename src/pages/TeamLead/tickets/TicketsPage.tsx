import { useEffect, useState } from 'react'
import api from '../../../utils/api'

const TeamLeadTickets = () => {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchTickets()
  }, [statusFilter])

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets', {
        params: statusFilter !== 'all'
          ? { status: statusFilter }
          : {}
      })

      console.log('TICKETS RESPONSE:', res.data)

      setTickets(res.data.data ?? res.data)
    } catch (err) {
      console.error('Failed to load tickets', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading tickets...</div>

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Ticket Center</h1>

      {/* Filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        style={{ marginBottom: 20 }}
      >
        <option value="all">All</option>
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
        <option value="CLOSED">Closed</option>
      </select>

      {/* Tickets */}
      {tickets.map(ticket => (
        <div
          key={ticket.id}
          style={{
            padding: 16,
            marginBottom: 12,
            border: '1px solid #e5e5e5',
            borderRadius: 10,
            background: '#fff'
          }}
        >
          <strong>{ticket.title}</strong>
          <div>Status: {ticket.status}</div>
          <div>Priority: {ticket.priority}</div>
          <div>Project: {ticket.project?.name}</div>
        </div>
      ))}

      {tickets.length === 0 && (
        <div>No tickets found</div>
      )}
    </div>
  )
}

export default TeamLeadTickets