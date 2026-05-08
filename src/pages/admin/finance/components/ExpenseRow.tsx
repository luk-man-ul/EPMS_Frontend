import type { ExpenseRecord } from '../types/finance.types'
import { formatCurrency, formatDate } from '../finance.utils'

interface Props {
  expense: ExpenseRecord
  /** Hide the Employee cell — used in employee drill-down where employee is already known */
  hideEmployee?: boolean
  /** Hide the Project cell — used in project drill-down where project is already known */
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

// Category badge — salary gets blue, others get green
const CategoryBadge = ({ name }: { name: string }) => {
  const isSalary = name.toLowerCase() === 'salary'
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 600,
      display: 'inline-block',
      background: isSalary ? '#eff6ff' : '#f0fdf4',
      color:      isSalary ? '#2563eb' : '#16a34a',
    }}>
      {name}
    </span>
  )
}

const ExpenseRow = ({
  expense,
  hideEmployee = false,
  hideProject = false,
  hideActions = false,
  readOnly = false,
}: Props) => {
  const suppressActions = hideActions || readOnly

  // Build the entity label respecting hide flags
  const employeeLabel = expense.employee
    ? `${expense.employee.firstName} ${expense.employee.lastName}`
    : null
  const projectLabel = expense.project?.name ?? null

  // What to show in the combined Employee/Project cell
  const entityLabel = (() => {
    if (!hideEmployee && employeeLabel) return employeeLabel
    if (!hideProject && projectLabel)   return projectLabel
    if (hideEmployee && projectLabel)   return projectLabel   // employee drill-down: show project
    if (hideProject && employeeLabel)   return employeeLabel  // project drill-down: show employee
    return '—'
  })()

  // Sub-label (project name under employee name when both exist and neither is hidden)
  const showSubLabel =
    !hideEmployee && !hideProject && expense.employee && expense.project

  return (
    <tr
      style={{ borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s ease', backgroundColor: 'transparent' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Category badge */}
      <td style={{ padding: '16px 20px' }}>
        <CategoryBadge name={expense.category.name} />
      </td>

      {/* Amount */}
      <td style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>
          {formatCurrency(expense.amount)}
        </div>
      </td>

      {/* Date */}
      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
        {formatDate(expense.expenseDate)}
      </td>

      {/* Employee / Project — context-aware */}
      <td style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
          {entityLabel}
        </div>
        {showSubLabel && (
          <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
            {expense.project!.name}
          </div>
        )}
      </td>

      {/* Payment method + bank account */}
      <td style={{ padding: '16px 20px' }}>
        <PaymentBadge method={expense.paymentMethod} />
        {expense.bankAccount && (
          <div style={{ fontSize: '12px', color: '#999', marginTop: '3px' }}>
            {expense.bankAccount.name}
          </div>
        )}
      </td>

      {/* Description */}
      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666', maxWidth: '180px' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
          {expense.description || '—'}
        </span>
      </td>

      {/* Created By */}
      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666' }}>
        {expense.createdBy.firstName} {expense.createdBy.lastName}
      </td>

      {/* Actions — hidden in read-only mode */}
      {!suppressActions && (
        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
          <button
            style={{ border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', fontSize: '13px', padding: '6px 12px', borderRadius: '8px', color: '#1a1a1a', fontWeight: 500, transition: 'all 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fafafa'; e.currentTarget.style.borderColor = '#d4d4d4' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e5e5e5' }}
          >
            Edit
          </button>
        </td>
      )}
    </tr>
  )
}

export default ExpenseRow
