import { useEffect, useState } from 'react'
import api from '../../../../../utils/api'

interface Props {
  projectId: string
}

const TicketsTab = ({ projectId }: Props) => {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/tickets', {
          params: { projectId }
        })
        setTickets(res.data.data ?? res.data)
      } catch (err) {
        console.error('Failed to load tickets', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [projectId])

  if (loading) return <div>Loading tickets...</div>

  return (
    <div>
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          style={{
            background: '#fff',
            padding: 16,
            borderRadius: 10,
            marginBottom: 12,
            border: '1px solid #e5e5e5'
          }}
        >
          <strong>{ticket.title}</strong>
          <div>Status: {ticket.status}</div>
          <div>Priority: {ticket.priority}</div>
        </div>
      ))}

      {tickets.length === 0 && (
        <div>No tickets found</div>
      )}
    </div>
  )
}

export default TicketsTab