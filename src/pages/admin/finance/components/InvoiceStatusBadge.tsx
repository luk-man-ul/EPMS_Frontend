import type { InvoiceStatus } from '../types/finance.types'

interface Props {
  status: InvoiceStatus
}

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; bg: string; color: string }> = {
  DRAFT:     { label: 'Draft',     bg: '#f5f5f5', color: '#666'    },
  SENT:      { label: 'Sent',      bg: '#eff6ff', color: '#2563eb' },
  PAID:      { label: 'Paid',      bg: '#f0fdf4', color: '#16a34a' },
  OVERDUE:   { label: 'Overdue',   bg: '#fff5f5', color: '#dc2626' },
  CANCELLED: { label: 'Cancelled', bg: '#1a1a1a', color: '#fff'    },
}

const InvoiceStatusBadge = ({ status }: Props) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 600,
      display: 'inline-block',
      background: cfg.bg,
      color: cfg.color,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}

export default InvoiceStatusBadge
