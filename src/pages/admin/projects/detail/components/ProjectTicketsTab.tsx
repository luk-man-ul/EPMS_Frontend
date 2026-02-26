interface Props {
  project: any
}

const ProjectTicketsTab = ({ project }: Props) => {
  const tickets = project.tickets || []

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>Tickets ({tickets.length})</h3>

      {tickets.length === 0 && (
        <div style={{ padding: '40px', background: '#fafafa', borderRadius: '12px' }}>
          No tickets yet.
        </div>
      )}

      {tickets.map((ticket: any) => (
        <div key={ticket.id} style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
          <strong>{ticket.title}</strong>
          <div>Status: {ticket.status}</div>
          <div>Priority: {ticket.priority}</div>
        </div>
      ))}
    </div>
  )
}

export default ProjectTicketsTab