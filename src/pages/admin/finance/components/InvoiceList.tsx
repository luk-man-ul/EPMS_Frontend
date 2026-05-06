import type { Invoice, InvoiceStatus } from '../types/finance.types'
import { formatCurrency, formatDate } from '../finance.utils'
import InvoiceStatusBadge from './InvoiceStatusBadge'

// ── Props ─────────────────────────────────────────────────────────────────────

interface Filters {
  status: string
  search: string
}

interface Props {
  invoices: Invoice[]
  loading: boolean
  error: string | null
  filters: Filters
  onFiltersChange: (f: Filters) => void
  onView:   (invoice: Invoice) => void
  onEdit:   (invoice: Invoice) => void
  onDelete: (invoice: Invoice) => void
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
  padding: '9px 14px',
  borderRadius: '8px',
  border: '1px solid #e5e5e5',
  background: '#fff',
  fontSize: '13px',
  color: '#1a1a1a',
  cursor: 'pointer',
  outline: 'none',
}

const STATUSES: Array<{ value: string; label: string }> = [
  { value: '',           label: 'All Status'  },
  { value: 'DRAFT',      label: 'Draft'       },
  { value: 'SENT',       label: 'Sent'        },
  { value: 'PAID',       label: 'Paid'        },
  { value: 'OVERDUE',    label: 'Overdue'     },
  { value: 'CANCELLED',  label: 'Cancelled'   },
]

// ── Component ─────────────────────────────────────────────────────────────────

const InvoiceList = ({
  invoices, loading, error, filters, onFiltersChange,
  onView, onEdit, onDelete,
}: Props) => {
  return (
    <div>
      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
          style={selectStyle}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search invoice no. or client..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          style={{
            padding: '9px 14px',
            borderRadius: '8px',
            border: '1px solid #e5e5e5',
            fontSize: '13px',
            outline: 'none',
            width: '260px',
          }}
        />

        {(filters.status || filters.search) && (
          <button
            onClick={() => onFiltersChange({ status: '', search: '' })}
            style={{ ...selectStyle, color: '#666' }}
          >
            Clear
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#999' }}>
          {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'}
        </span>
      </div>

      {/* ── Table ── */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
            Loading invoices...
          </div>
        ) : error ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>
            {error}
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧾</div>
            <div style={{ fontSize: '15px', fontWeight: 500, color: '#1a1a1a', marginBottom: '6px' }}>
              No invoices yet
            </div>
            <div style={{ fontSize: '13px', color: '#999' }}>
              Create your first invoice using the button above.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: 500, borderBottom: '1px solid #e5e5e5', background: '#fafafa' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 500 }}>Invoice No</th>
                  <th style={{ padding: '14px 20px', fontWeight: 500 }}>Client</th>
                  <th style={{ padding: '14px 20px', fontWeight: 500 }}>Project</th>
                  <th style={{ padding: '14px 20px', fontWeight: 500, textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '14px 20px', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 500 }}>Due Date</th>
                  <th style={{ padding: '14px 20px', fontWeight: 500 }}>Revenue</th>
                  <th style={{ padding: '14px 20px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <InvoiceRow
                    key={inv.id}
                    invoice={inv}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Row sub-component ─────────────────────────────────────────────────────────

interface RowProps {
  invoice: Invoice
  onView:   (inv: Invoice) => void
  onEdit:   (inv: Invoice) => void
  onDelete: (inv: Invoice) => void
}

const InvoiceRow = ({ invoice, onView, onEdit, onDelete }: RowProps) => {
  const isPaid = invoice.status === 'PAID'
  const isOverdue = invoice.status === 'OVERDUE'

  return (
    <tr
      style={{ borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s', backgroundColor: 'transparent' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Invoice No */}
      <td style={{ padding: '14px 20px' }}>
        <button
          onClick={() => onView(invoice)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px', fontWeight: 600, color: '#2563eb' }}
        >
          {invoice.invoiceNo}
        </button>
      </td>

      {/* Client */}
      <td style={{ padding: '14px 20px', fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
        {invoice.clientName}
        {invoice.clientGSTIN && (
          <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{invoice.clientGSTIN}</div>
        )}
      </td>

      {/* Project */}
      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#666' }}>
        {invoice.project.name}
      </td>

      {/* Amount */}
      <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
        {formatCurrency(invoice.totalAmount)}
      </td>

      {/* Status */}
      <td style={{ padding: '14px 20px' }}>
        <InvoiceStatusBadge status={invoice.status as InvoiceStatus} />
      </td>

      {/* Due Date */}
      <td style={{ padding: '14px 20px', fontSize: '13px', color: isOverdue ? '#dc2626' : '#1a1a1a', fontWeight: isOverdue ? 600 : 400 }}>
        {formatDate(invoice.dueDate)}
      </td>

      {/* Linked Revenue */}
      <td style={{ padding: '14px 20px', fontSize: '13px' }}>
        {invoice.revenue ? (
          <span style={{ color: '#16a34a', fontWeight: 500 }}>
            {formatCurrency(invoice.revenue.amount)}
          </span>
        ) : (
          <span style={{ color: '#bbb' }}>—</span>
        )}
      </td>

      {/* Actions */}
      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => onView(invoice)}
            style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #e5e5e5', background: '#fff', fontSize: '12px', cursor: 'pointer', color: '#1a1a1a' }}
          >
            View
          </button>
          {!isPaid && (
            <button
              onClick={() => onEdit(invoice)}
              style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #e5e5e5', background: '#fff', fontSize: '12px', cursor: 'pointer', color: '#1a1a1a' }}
            >
              Edit
            </button>
          )}
          {!isPaid && (
            <button
              onClick={() => onDelete(invoice)}
              style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff5f5', fontSize: '12px', cursor: 'pointer', color: '#dc2626' }}
            >
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

export default InvoiceList
