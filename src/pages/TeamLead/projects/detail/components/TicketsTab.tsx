interface Props {
  tickets: any[]
}

const TicketsTab = ({ tickets }: Props) => {
  if (!tickets || tickets.length === 0)
    return <div>No tickets found</div>

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
          <div>Reporter: {ticket.reporter}</div>
          <div>Assignee: {ticket.assignee}</div>
        </div>
      ))}
    </div>
  )
}

export default TicketsTab