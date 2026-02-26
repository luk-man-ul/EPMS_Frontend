import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../../../utils/api'

const TicketDetailPage = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<'restricted' | 'notfound' | 'failed' | null>(null)

  const fetchTicket = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await api.get(`/tickets/${ticketId}`)

      setTicket(res.data)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('restricted')
      } else if (err.response?.status === 404) {
        setError('notfound')
      } else {
        setError('failed')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ticketId) fetchTicket()
  }, [ticketId])

  if (loading) return <div>Loading ticket...</div>

  if (error === 'restricted') {
    return <div>🔒 Restricted Access</div>
  }

  if (error === 'notfound') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>
          Ticket Not Found
        </div>
        <button
          onClick={() => navigate('/teamlead/tickets')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#1a1a1a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          ← Back to Tickets
        </button>
      </div>
    )
  }

  if (error === 'failed') return <div>Failed to load ticket</div>

  if (!ticket) return null

  const formatStatus = (status: string) =>
    status.replace(/_/g, ' ').toLowerCase()

  const formatPriority = (priority: string) =>
    priority.toLowerCase()

  const assignedTo = ticket.assignee
    ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
    : 'Unassigned'

  const reporter = `${ticket.reporter.firstName} ${ticket.reporter.lastName}`

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/teamlead/tickets')}
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

      {/* Main Container */}
      <div
        style={{
          background: '#ffffff',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid #e5e5e5',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '16px',
          }}
        >
          {ticket.title}
        </h1>

        {/* Meta Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <Meta label="Ticket ID" value={ticket.id} mono />
          <Meta label="Project" value={ticket.project?.name} />
          <Meta label="Reporter" value={reporter} />
          <Meta label="Assigned To" value={assignedTo} />
          <Meta label="Status" value={formatStatus(ticket.status)} />
          <Meta label="Priority" value={formatPriority(ticket.priority)} />
          <Meta label="Created At" value={new Date(ticket.createdAt).toLocaleString()} />
          {ticket.resolvedAt && (
            <Meta label="Resolved At" value={new Date(ticket.resolvedAt).toLocaleString()} />
          )}
          {ticket.closedAt && (
            <Meta label="Closed At" value={new Date(ticket.closedAt).toLocaleString()} />
          )}
        </div>

        {/* Description */}
        <Section title="Description">
          {ticket.description}
        </Section>

        {/* Resolution */}
        {ticket.resolution && (
          <Section title="Resolution">
            {ticket.resolution}
          </Section>
        )}

        {/* Status History */}
        {ticket.statusHistory?.length > 0 && (
          <Section title="Status History">
            {ticket.statusHistory.map((h: any) => (
              <div key={h.id} style={{ marginBottom: '8px', fontSize: '14px' }}>
                {h.oldStatus} → {h.newStatus} 
                {' '}({new Date(h.changedAt).toLocaleString()})
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  )
}

const Meta = ({ label, value, mono }: any) => (
  <div>
    <div style={{ fontSize: '13px', color: '#666666', marginBottom: '4px' }}>
      {label}
    </div>
    <div
      style={{
        fontSize: '16px',
        fontWeight: 600,
        fontFamily: mono ? 'monospace' : 'inherit',
        textTransform: 'capitalize',
      }}
    >
      {value}
    </div>
  </div>
)

const Section = ({ title, children }: any) => (
  <div
    style={{
      marginBottom: '24px',
      padding: '16px',
      background: '#fafafa',
      borderRadius: '10px',
    }}
  >
    <div style={{ fontSize: '13px', color: '#666666', marginBottom: '8px' }}>
      {title}
    </div>
    <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
      {children}
    </div>
  </div>
)

export default TicketDetailPage