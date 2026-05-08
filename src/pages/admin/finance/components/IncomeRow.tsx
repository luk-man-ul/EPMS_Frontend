import type { Revenue } from '../types/finance.types'
import { formatCurrency, formatDate } from '../finance.utils'

interface Props {
  revenue: Revenue
  /** Hide the Project column — used in project drill-down where project is already known */
  hideProject?: boolean
  /** Hide the Actions column — used in read-only analytics drill-down tables */
  hideActions?: boolean
  /** Alias for hideActions */
  readOnly?: boolean
}

// Small pill badge for payment method
const PaymentBadge = ({ method }: { method?: string | null }) => {
  if (!method) return <span style={{ color: '#bbb', fontSize: '13px' }}>—</span>
  return (
    <span style={{
      padding: '3px 8px',
      borderRadius: '5px',
      fontSize: '12px',
      fontWeight: 600,
      background: method === 'ONLINE' ? '#eff6ff' : '#f5f5f5',
      color: method === 'ONLINE' ? '#2563eb' : '#555',
      display: 'inline-block',
    }}>
      {method}
    </span>
  )
}

const IncomeRow = ({ revenue, hideProject = false, hideActions = false, readOnly = false }: Props) => {
  const suppressActions = hideActions || readOnly

  return (
    <tr
      style={{ borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s ease', backgroundColor: 'transparent' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Project — hidden in project drill-down */}
      {!hideProject && (
        <td style={{ padding: '16px 20px' }}>
          <div style={{ fontWeight: 500, color: '#1a1a1a', fontSize: '14px' }}>
            {revenue.project.name}
          </div>
        </td>
      )}

      {/* Amount */}
      <td style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>
          {formatCurrency(revenue.amount)}
        </div>
      </td>

      {/* Received Date */}
      <td style={{ padding: '16px 20px' }}>
        <span style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
          {formatDate(revenue.receivedDate)}
        </span>
      </td>

      {/* Payment method + bank account */}
      <td style={{ padding: '16px 20px' }}>
        <PaymentBadge method={revenue.paymentMethod} />
        {revenue.bankAccount && (
          <div style={{ fontSize: '12px', color: '#999', marginTop: '3px' }}>
            {revenue.bankAccount.name}
          </div>
        )}
      </td>

      {/* Description */}
      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666', maxWidth: '220px' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
          {revenue.description || '—'}
        </span>
      </td>

      {/* Created By */}
      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666' }}>
        {revenue.createdBy.firstName} {revenue.createdBy.lastName}
      </td>

      {/* Invoice link (if present) */}
      <td style={{ padding: '16px 20px', fontSize: '13px' }}>
        {revenue.invoice ? (
          <span style={{
            padding: '3px 8px',
            borderRadius: '5px',
            fontSize: '12px',
            fontWeight: 500,
            background: '#eff6ff',
            color: '#2563eb',
            display: 'inline-block',
          }}>
            {revenue.invoice.invoiceNo}
          </span>
        ) : (
          <span style={{ color: '#bbb' }}>—</span>
        )}
      </td>

      {/* Actions — hidden in read-only mode */}
      {!suppressActions && (
        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              style={{ border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', fontSize: '13px', padding: '6px 12px', borderRadius: '8px', color: '#1a1a1a', fontWeight: 500, transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fafafa'; e.currentTarget.style.borderColor = '#d4d4d4' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e5e5e5' }}
            >
              Edit
            </button>
            <button
              style={{ border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', fontSize: '18px', padding: '6px 10px', borderRadius: '8px', color: '#666', transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fafafa'; e.currentTarget.style.borderColor = '#d4d4d4' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e5e5e5' }}
            >
              ⋮
            </button>
          </div>
        </td>
      )}
    </tr>
  )
}

export default IncomeRow
