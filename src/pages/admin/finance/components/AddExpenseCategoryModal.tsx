import { useState } from 'react'
import { createExpenseCategory } from '../finance.api'
import { useToast } from '../../../../context/ToastContext'
import type { ExpenseCategory } from '../types/finance.types'

interface Props {
  onClose: () => void
  /** Called with the newly created record so the parent can append + auto-select it */
  onCreated: (category: ExpenseCategory) => void
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid #e5e5e5',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: '#555',
  marginBottom: '6px',
}

/**
 * AddExpenseCategoryModal
 *
 * Same architecture as AddPaymentMethodModal — opens from the category
 * dropdown sentinel option "+ Add Category", creates the category via
 * POST /finance/expense-categories, then calls onCreated() so the parent
 * appends it to its local categories list and auto-selects it.
 */
export function AddExpenseCategoryModal({ onClose, onCreated }: Props) {
  const { showToast } = useToast()

  const [name,   setName]   = useState('')
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  const handleSave = async () => {
    setError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Category name is required')
      return
    }
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    try {
      setSaving(true)
      const created = await createExpenseCategory(trimmedName)
      showToast('success', `"${created.name}" added as an expense category`)
      onCreated(created)
      onClose()
    } catch (err: any) {
      // 409 Conflict = duplicate — surface the backend message directly
      const msg: string = err?.response?.data?.message || 'Failed to create category'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !saving) handleSave()
    if (e.key === 'Escape') onClose()
  }

  return (
    /* ── Backdrop ── */
    <div
      style={{
        position:       'fixed',
        inset:          0,
        background:     'rgba(0, 0, 0, 0.35)',
        zIndex:         1000,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* ── Modal card ── */}
      <div
        style={{
          background:   '#fff',
          borderRadius: '16px',
          padding:      '28px 28px 24px',
          width:        '380px',
          maxWidth:     '92vw',
          boxShadow:    '0 20px 60px rgba(0, 0, 0, 0.15)',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
            Add Expense Category
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#999', lineHeight: 1, padding: '2px 4px' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ marginBottom: '14px', padding: '10px 12px', borderRadius: '8px', background: '#fff5f5', color: '#dc2626', fontSize: '13px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {/* Category name */}
        <div style={{ marginBottom: '8px' }}>
          <label style={labelStyle}>Category Name *</label>
          <input
            type="text"
            placeholder="e.g. Office Supplies"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null) }}
            style={inputStyle}
            disabled={saving}
            autoFocus
          />
        </div>

        <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#999' }}>
          Category names must be unique. "Salary" is reserved for payroll expenses.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              padding:      '8px 16px',
              borderRadius: '8px',
              border:       '1px solid #e5e5e5',
              background:   '#fff',
              color:        '#555',
              fontSize:     '13px',
              fontWeight:   500,
              cursor:       saving ? 'not-allowed' : 'pointer',
              opacity:      saving ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding:      '8px 18px',
              borderRadius: '8px',
              border:       'none',
              background:   saving ? '#666' : '#1a1a1a',
              color:        '#fff',
              fontSize:     '13px',
              fontWeight:   500,
              cursor:       saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
