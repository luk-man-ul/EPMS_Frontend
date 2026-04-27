import type { Revenue } from '../types/finance.types'
import { formatCurrency, formatDate } from '../finance.utils'

interface Props {
  revenue: Revenue
}

const IncomeRow = ({ revenue }: Props) => {
  const formattedDate = formatDate(revenue.receivedDate)

  return (
    <tr
      style={{
        borderBottom: '1px solid #f5f5f5',
        transition: 'background 0.15s ease',
        backgroundColor: 'transparent',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <td style={{ padding: '16px 20px' }}>
        <div style={{ fontWeight: 500, color: '#1a1a1a', fontSize: '14px' }}>
          {revenue.project.name}
        </div>
      </td>

      <td style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>
          {formatCurrency(revenue.amount)}
        </div>
      </td>

      <td style={{ padding: '16px 20px' }}>
        <span style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
          {formattedDate}
        </span>
      </td>

      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666', maxWidth: '240px' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
          {revenue.description || '—'}
        </span>
      </td>

      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666' }}>
        {revenue.createdBy.firstName} {revenue.createdBy.lastName}
      </td>

      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            style={{
              border: '1px solid #e5e5e5',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              padding: '6px 12px',
              borderRadius: '8px',
              color: '#1a1a1a',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fafafa'
              e.currentTarget.style.borderColor = '#d4d4d4'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff'
              e.currentTarget.style.borderColor = '#e5e5e5'
            }}
          >
            Edit
          </button>
          <button
            style={{
              border: '1px solid #e5e5e5',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '6px 10px',
              borderRadius: '8px',
              color: '#666',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fafafa'
              e.currentTarget.style.borderColor = '#d4d4d4'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff'
              e.currentTarget.style.borderColor = '#e5e5e5'
            }}
          >
            ⋮
          </button>
        </div>
      </td>
    </tr>
  )
}

export default IncomeRow
