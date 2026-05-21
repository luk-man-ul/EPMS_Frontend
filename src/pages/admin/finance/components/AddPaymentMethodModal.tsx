import { useState } from 'react'
import { createPaymentSource } from '../finance.api'
import { useToast } from '../../../../context/ToastContext'
import type { BankAccount } from '../types/finance.types'

interface Props {
  onClose: () => void
  /** Called with the newly created record so the parent can append + auto-select it */
  onCreated: (account: BankAccount) => void
}

// Payment source types the admin can choose from
const TYPE_OPTIONS = [
  { value: 'BANK_ACCOUNT', label: 'Bank Account' },
  { value: 'CASH',         label: 'Cash'         },
  { value: 'UPI',          label: 'UPI'           },
  { value: 'PETTY_CASH',   label: 'Petty Cash'    },
  { value: 'OTHER',        label: 'Other'         },
] as const

type PaymentSourceType = typeof TYPE_OPTIONS[number]['value']

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
 * AddPaymentMethodModal
 *
 * Mirrors the "+ Add Skill" inline pattern from EmployeeForm but as a
 * proper modal — appropriate here because the payment method form has
 * multiple fields and lives inside an already-complex finance form.
 *
 * On success:
 *   1. Calls onCreated(newAccount) so the parent appends it to its
 *      bankAccounts list and auto-selects it.
 *   2. Shows a success toast.
 *   3. Closes itself.
 */
export function AddPaymentMethodModal({ onClose, onCreated }: Props) {
  const { showToast } = useToast()

  const [name,     setName]     = useState('')
  const [type,     setType]     = useState<PaymentSourceType>('BANK_ACCOUNT')
  const [bankName, setBankName] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const isBankAccount = type === 'BANK_ACCOUNT'

  const handleSave = async () => {
    setError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Payment method name is required')
      return
    }
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    try {
      setSaving(true)
      const created = await createPaymentSource({
        name:     trimmedName,
        type,
        bankName: bankName.trim() || undefined,
      })
      showToast('success', `"${created.name}" added as a payment method`)
      onCreated(created)
      onClose()
    } catch (err: any) {
      const msg: string = err?.response?.data?.message || 'Failed to create payment method'
      // 409 Conflict = duplicate — surface it clearly
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
        position:        'fixed',
        inset:           0,
        background:      'rgba(0, 0, 0, 0.35)',
        zIndex:          1000,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* ── Modal card ── */}
      <div
        style={{
          background:   '#fff',
          borderRadius: '16px',
          padding:      '28px 28px 24px',
          width:        '420px',
          maxWidth:     '92vw',
          boxShadow:    '0 20px 60px rgba(0, 0, 0, 0.15)',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
            Add Payment Method
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

        {/* Type */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Type *</label>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value as PaymentSourceType); setError(null) }}
            style={{ ...inputStyle, cursor: 'pointer' }}
            disabled={saving}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>
            {isBankAccount ? 'Account Name *' : 'Name *'}
          </label>
          <input
            type="text"
            placeholder={
              isBankAccount
                ? 'e.g. SBI Savings Account'
                : type === 'CASH'       ? 'e.g. Office Cash'
                : type === 'UPI'        ? 'e.g. Company UPI'
                : type === 'PETTY_CASH' ? 'e.g. Petty Cash Box'
                : 'e.g. Payment Method Name'
            }
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null) }}
            style={inputStyle}
            disabled={saving}
            autoFocus
          />
        </div>

        {/* Bank Name — only shown for BANK_ACCOUNT */}
        {isBankAccount && (
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Bank Name</label>
            <input
              type="text"
              placeholder="e.g. State Bank of India"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              style={inputStyle}
              disabled={saving}
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
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
