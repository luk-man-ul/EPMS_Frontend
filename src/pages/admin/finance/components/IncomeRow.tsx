import type { Revenue } from '../types/finance.types'
import { formatCurrency, formatDate } from '../finance.utils'

interface Props {
  revenue: Revenue
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

const IncomeRow = ({ revenue }: Props) => {
  return (
    <tr
      style={{ borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s ease', backgroundColor: 'transparent' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Project */}
      <td style={{ padding: '16px 20px' }}>
        <div style={{ fontWeight: 500, color: '#1a1a1a', fontSize: '14px' }}>
          {revenue.project.name}
        </div>
      </td>

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

      {/* Actions */}
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
    </tr>
  )
}

export default IncomeRow
