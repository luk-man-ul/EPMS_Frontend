import { useState, useEffect } from 'react'
import type { Ticket } from '../types/ticket.types'
import TicketRow from './TicketRow'
import TicketStatusComponent from './TicketStatus'
import TicketPriority from './TicketPriority'
import TicketActions from './TicketActions'

interface Props {
  tickets: Ticket[]
  loading: boolean
  onEdit: (ticketId: string) => void
  onDelete: (ticketId: string) => void
}

const TicketTable = ({ tickets, loading, onEdit, onDelete }: Props) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        Loading tickets...
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        No tickets found
      </div>
    )
  }

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'transparent' }}>
        {tickets.map((ticket) => {
          const isCritical = ticket.priority === 'URGENT'

          const createdBy = `${ticket.reporter.firstName} ${ticket.reporter.lastName}`
          const assignedTo = ticket.assignee
            ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
            : 'Unassigned'

          const projectName = ticket.project?.name ?? 'No Project'

          return (
            <div
              key={ticket.id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid #f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: isCritical ? '0 4px 12px rgba(239, 68, 68, 0.05)' : '0 4px 12px rgba(0, 0, 0, 0.03)',
                position: 'relative',
                borderLeft: isCritical ? '4px solid #ef4444' : '1px solid #f0f0f0',
              }}
            >
              {/* Header Row: ID, Title & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: '#888',
                      backgroundColor: '#f3f4f6',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}>
                      #{ticket.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span style={{ fontSize: '11px', color: '#888', fontWeight: 500 }}>
                      {ticket.type}
                    </span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a', marginTop: '6px', lineHeight: '1.4' }}>
                    {ticket.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', fontWeight: 500 }}>
                    {projectName}
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <TicketActions
                    ticketId={ticket.id}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              </div>

              {/* Middle Row: Created By & Assigned To */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f5f5', paddingTop: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#888' }}>Created By</div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginTop: '1px' }}>
                    {createdBy}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#888' }}>Assigned To</div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginTop: '1px' }}>
                    {assignedTo}
                  </div>
                </div>
              </div>

              {/* Footer Row: Status & SLA (Priority) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f5f5', paddingTop: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <TicketStatusComponent status={ticket.status} />
                  <TicketPriority priority={ticket.priority} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ overflow: 'visible', position: 'relative' }}>
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
          {tickets.map((ticket) => (
            <TicketRow 
              key={ticket.id} 
              ticket={ticket}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TicketTable