import { useMemo } from 'react'
import { formatCurrency } from '../finance.utils'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ItemRow {
  description: string
  quantity: string   // kept as string for controlled input
  unitPrice: string  // kept as string for controlled input
}

interface EditableProps {
  readonly: false
  items: ItemRow[]
  onChange: (items: ItemRow[]) => void
}

interface ReadonlyProps {
  readonly: true
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>
  /** Authoritative subtotal from backend (sum of item totals, before GST) */
  invoiceSubtotal?: number
}

type Props = EditableProps | ReadonlyProps

// ── Shared styles ─────────────────────────────────────────────────────────────

const cellInput: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '6px',
  border: '1px solid #e5e5e5',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
}

const th: React.CSSProperties = {
  padding: '10px 14px',
  fontWeight: 500,
  fontSize: '12px',
  color: '#666',
  textAlign: 'left',
  background: '#fafafa',
  borderBottom: '1px solid #e5e5e5',
}

const td: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: '13px',
  color: '#1a1a1a',
  borderBottom: '1px solid #f5f5f5',
  verticalAlign: 'middle',
}

// ── Component ─────────────────────────────────────────────────────────────────

const InvoiceItemTable = (props: Props) => {
  // ── Editable mode ──────────────────────────────────────────────────────────
  if (!props.readonly) {
    const editProps = props as EditableProps
    const { items, onChange } = editProps

    const previewTotal = useMemo(
      () => items.reduce((sum, r) => sum + (parseFloat(r.quantity) || 0) * (parseFloat(r.unitPrice) || 0), 0),
      [items],
    )

    const updateRow = (idx: number, field: keyof ItemRow, value: string) => {
      const next = items.map((row, i) => i === idx ? { ...row, [field]: value } : row)
      onChange(next)
    }

    const addRow = () =>
      onChange([...items, { description: '', quantity: '1', unitPrice: '0' }])

    const removeRow = (idx: number) => {
      if (items.length === 1) return // keep at least one row
      onChange(items.filter((_, i) => i !== idx))
    }

    return (
      <div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
            <thead>
              <tr>
                <th style={{ ...th, width: '44%' }}>Description *</th>
                <th style={{ ...th, width: '14%' }}>Qty *</th>
                <th style={{ ...th, width: '18%' }}>Unit Price *</th>
                <th style={{ ...th, width: '16%', textAlign: 'right' }}>Total</th>
                <th style={{ ...th, width: '8%' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => {
                const rowTotal = (parseFloat(row.quantity) || 0) * (parseFloat(row.unitPrice) || 0)
                return (
                  <tr key={idx}>
                    <td style={td}>
                      <input
                        type="text"
                        placeholder="Item description"
                        value={row.description}
                        onChange={(e) => updateRow(idx, 'description', e.target.value)}
                        style={cellInput}
                      />
                    </td>
                    <td style={td}>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="1"
                        value={row.quantity}
                        onChange={(e) => updateRow(idx, 'quantity', e.target.value)}
                        style={cellInput}
                      />
                    </td>
                    <td style={td}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={row.unitPrice}
                        onChange={(e) => updateRow(idx, 'unitPrice', e.target.value)}
                        style={cellInput}
                      />
                    </td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(rowTotal)}
                    </td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        disabled={items.length === 1}
                        title="Remove row"
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: items.length === 1 ? 'not-allowed' : 'pointer',
                          color: items.length === 1 ? '#ccc' : '#dc2626',
                          fontSize: '16px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer: add row + preview total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <button
            type="button"
            onClick={addRow}
            style={{
              padding: '7px 14px',
              borderRadius: '7px',
              border: '1px dashed #d4d4d4',
              background: '#fafafa',
              fontSize: '13px',
              color: '#555',
              cursor: 'pointer',
            }}
          >
            + Add row
          </button>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
            Preview total: {formatCurrency(previewTotal)}
            <span style={{ fontSize: '11px', color: '#999', fontWeight: 400, marginLeft: '6px' }}>
              (backend recomputes on save)
            </span>
          </div>
        </div>
      </div>
    )
  }

  // ── Read-only mode ─────────────────────────────────────────────────────────
  const { items } = props
  const subtotal = props.invoiceSubtotal ?? items.reduce((s, r) => s + r.total, 0)

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
        <thead>
          <tr>
            <th style={{ ...th, width: '50%' }}>Description</th>
            <th style={{ ...th, width: '12%', textAlign: 'right' }}>Qty</th>
            <th style={{ ...th, width: '18%', textAlign: 'right' }}>Unit Price</th>
            <th style={{ ...th, width: '20%', textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td style={td}>{item.description}</td>
              <td style={{ ...td, textAlign: 'right' }}>{item.quantity}</td>
              <td style={{ ...td, textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ ...td, textAlign: 'right', fontWeight: 600, borderTop: '2px solid #e5e5e5', paddingTop: '12px' }}>
              Subtotal
            </td>
            <td style={{ ...td, textAlign: 'right', fontWeight: 700, fontSize: '15px', borderTop: '2px solid #e5e5e5', paddingTop: '12px', color: '#1a1a1a' }}>
              {formatCurrency(subtotal)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default InvoiceItemTable
