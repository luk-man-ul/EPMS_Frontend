import type { ExpenseRecord } from '../types/finance.types'
import { formatCurrency, formatDate } from '../finance.utils'

interface Props {
  expense: ExpenseRecord
}

const typeBadge: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
  display: 'inline-block',
}

const ExpenseRow = ({ expense }: Props) => {
  const formattedDate = formatDate(expense.expenseDate)

  const entityLabel = expense.employee
    ? `${expense.employee.firstName} ${expense.employee.lastName}`
    : expense.project
    ? expense.project.name
    : '—'

  return (
    <tr
      style={{ borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s ease', backgroundColor: 'transparent' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Type badge */}
      <td style={{ padding: '16px 20px' }}>
        <span style={{
          ...typeBadge,
          background: expense.type === 'SALARY' ? '#eff6ff' : '#f5f5f5',
          color: expense.type === 'SALARY' ? '#2563eb' : '#666',
        }}>
          {expense.type}
        </span>
      </td>

      {/* Amount */}
      <td style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>
          {formatCurrency(expense.amount)}
        </div>
      </td>

      {/* Date */}
      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
        {formattedDate}
      </td>

      {/* Employee / Project */}
      <td style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
          {entityLabel}
        </div>
        {expense.employee && expense.project && (
          <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
            {expense.project.name}
          </div>
        )}
      </td>

      {/* Description */}
      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666', maxWidth: '200px' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
          {expense.description || '—'}
        </span>
      </td>

      {/* Created By */}
      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666' }}>
        {expense.createdBy.firstName} {expense.createdBy.lastName}
      </td>

      {/* Actions */}
      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
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
      </td>
    </tr>
  )
}

export default ExpenseRow
