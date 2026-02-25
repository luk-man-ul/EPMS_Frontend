import type { TicketStatus as TicketStatusType } from '../types/ticket.types'

interface Props {
  status: TicketStatusType
}

const statusConfig: Record<
  TicketStatusType,
  { bg: string; color: string; label: string }
> = {
  OPEN: {
    bg: '#e0f2fe',
    color: '#0369a1',
    label: 'Open',
  },
  IN_PROGRESS: {
    bg: '#fef3c7',
    color: '#92400e',
    label: 'In Progress',
  },
  RESOLVED: {
    bg: '#dcfce7',
    color: '#166534',
    label: 'Resolved',
  },
  CLOSED: {
    bg: '#f3f4f6',
    color: '#374151',
    label: 'Closed',
  },
  WAITING_FOR_USER: {
    bg: '#fee2e2',
    color: '#991b1b',
    label: 'Waiting',
  },
  REJECTED: {
    bg: '#fde2e2',
    color: '#b91c1c',
    label: 'Rejected',
  },
  REOPENED: {
    bg: '#e0e7ff',
    color: '#3730a3',
    label: 'Reopened',
  },
}

const TicketStatus = ({ status }: Props) => {
  const config = statusConfig[status]

  return (
    <span
      style={{
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 500,
        background: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  )
}

export default TicketStatus