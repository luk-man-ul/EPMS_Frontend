import type { Ticket } from '../types/ticket.types'
import TicketRow from './TicketRow'

interface Props {
  tickets: Ticket[]
  loading: boolean
  onEdit: (ticketId: string) => void
  onDelete: (ticketId: string) => void
}

const TicketTable = ({ tickets, loading, onEdit, onDelete }: Props) => {
  return (
    <div style={{ overflow: 'visible' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
      <thead>
        <tr
          style={{
            textAlign: 'left',
            fontSize: '12px',
            color: '#666',
            fontWeight: 500,
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>Ticket ID</th>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>Title</th>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>Project</th>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>Created By</th>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>Assigned To</th>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>Status</th>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>SLA</th>
          <th
            style={{
              padding: '16px 20px',
              textAlign: 'right',
              fontWeight: 500,
            }}
          >
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td colSpan={8} style={{ padding: 40, textAlign: 'center' }}>
              Loading tickets...
            </td>
          </tr>
        ) : tickets.length === 0 ? (
          <tr>
            <td colSpan={8} style={{ padding: 40, textAlign: 'center' }}>
              No tickets found
            </td>
          </tr>
        ) : (
          tickets.map((ticket) => (
            <TicketRow 
              key={ticket.id} 
              ticket={ticket}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </tbody>
    </table>
    </div>
  )
}

export default TicketTable