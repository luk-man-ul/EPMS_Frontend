import type { Ticket } from '../types/ticket.types'
import TicketStatus from './TicketStatus'
import TicketPriority from './TicketPriority'
import TicketActions from './TicketActions'

interface Props {
  ticket: Ticket
  onEdit: (ticketId: string) => void
  onDelete: (ticketId: string) => void
}

const TicketRow = ({ ticket, onEdit, onDelete }: Props) => {
  const isCritical = ticket.priority === 'URGENT'

  const createdBy = `${ticket.reporter.firstName} ${ticket.reporter.lastName}`
  const assignedTo = ticket.assignee
    ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
    : 'Unassigned'

  const projectName = ticket.project?.name ?? '—'

  return (
    <tr
      style={{
        borderBottom: '1px solid #f5f5f5',
        transition: 'background 0.15s ease',
        backgroundColor: isCritical ? '#fafafa' : 'transparent',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = '#fafafa')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = isCritical
          ? '#fafafa'
          : 'transparent')
      }
    >
      <td style={{ padding: '16px 20px' }}>
        <div
          style={{
            fontWeight: 600,
            color: '#1a1a1a',
            fontSize: '13px',
            fontFamily: 'monospace',
          }}
        >
          {ticket.id.slice(0, 8)}
        </div>
      </td>

      <td style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isCritical && <span style={{ fontSize: '16px' }}>🚨</span>}
          <div>
            <div
              style={{
                fontWeight: 500,
                color: '#1a1a1a',
                fontSize: '14px',
              }}
            >
              {ticket.title}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#999',
                marginTop: '2px',
              }}
            >
              {ticket.type}
            </div>
          </div>
        </div>
      </td>

      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666' }}>
        {projectName}
      </td>

      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666' }}>
        {createdBy}
      </td>

      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#1a1a1a' }}>
        {assignedTo}
      </td>

      <td style={{ padding: '16px 20px' }}>
        <TicketStatus status={ticket.status} />
      </td>

      <td style={{ padding: '16px 20px' }}>
        <TicketPriority priority={ticket.priority} />
      </td>

      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
        <TicketActions 
          ticketId={ticket.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </tr>
  )
}

export default TicketRow