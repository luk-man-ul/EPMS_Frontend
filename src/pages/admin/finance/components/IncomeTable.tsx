import { useState, useEffect } from 'react'
import { getRevenues, createRevenue, getBankAccounts } from '../finance.api'
import type { Revenue, BankAccount } from '../types/finance.types'
import IncomeRow from './IncomeRow'
import { getProjectOptions } from '../lookup.api'
import type { ProjectOption } from '../lookup.api'
import { useToast } from '../../../../context/ToastContext'
import { AddPaymentMethodModal } from './AddPaymentMethodModal'

interface Props {
  showForm?: boolean
  onFormClose?: () => void
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #e5e5e5',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
}

const EMPTY_FORM = {
  projectId: '',
  amount: '',
  receivedDate: '',
  description: '',
  bankAccountId: '',
}

const IncomeTable = ({ showForm = false, onFormClose }: Props) => {
  const { showToast } = useToast()

  // ── Revenue list ────────────────────────────────────────
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Dropdown data ───────────────────────────────────────
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])

  // ── Form state ──────────────────────────────────────────
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // ── Fetch revenues ──────────────────────────────────────
  const fetchRevenues = () => {
    setLoading(true)
    setError(null)
    getRevenues()
      .then(setRevenues)
      .catch((err: any) => setError(err.response?.data?.message || 'Failed to load revenue'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRevenues() }, [])

  // ── Fetch dropdowns ─────────────────────────────────────
  useEffect(() => {
    getProjectOptions().then(setProjects).catch(() => {})
    getBankAccounts().then(setBankAccounts).catch(() => {})
  }, [])

  // ── Clear bankAccountId when switching away from ONLINE ─


  // ── Form submit ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!form.projectId)                          { setFormError('Project is required'); return }
    if (!form.amount || Number(form.amount) <= 0) { setFormError('Amount must be greater than 0'); return }
    if (!form.receivedDate)                       { setFormError('Received date is required'); return }

    try {
      setSubmitting(true)
      await createRevenue({
        projectId:     form.projectId,
        amount:        Number(form.amount),
        receivedDate:  form.receivedDate,
        description:   form.description || undefined,
        bankAccountId: form.bankAccountId || undefined,
     })
      showToast('success', 'Revenue record created')
      setForm(EMPTY_FORM)
      onFormClose?.()
      fetchRevenues()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to create revenue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setForm(EMPTY_FORM)
    setFormError(null)
    onFormClose?.()
  }

  return (
    <div>
      {/* ── Add Payment Method Modal ── */}
      {showPaymentModal && (
        <AddPaymentMethodModal
          onClose={() => setShowPaymentModal(false)}
          onCreated={(newAccount) => {
            setBankAccounts((prev) => [...prev, newAccount])
            setForm((prev) => ({ ...prev, bankAccountId: newAccount.id }))
            setShowPaymentModal(false)
          }}
        />
      )}

      {/* ── Create Revenue Form ── */}
      {showForm && (
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e5e5', background: '#fafafa' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
            Add Revenue
          </div>

          {formError && (
            <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', background: '#fff5f5', color: '#dc2626', fontSize: '13px' }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Row 1: Project · Amount · Received Date · Description */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', alignItems: 'end' }}>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                  Project *
                </label>
                <select
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}
                >
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                  Amount *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                  Received Date *
                </label>
                <input
                  type="date"
                  value={form.receivedDate}
                  onChange={(e) => setForm({ ...form, receivedDate: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Optional note"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Row 2: Payment Method · Bank Account (conditional) */}
           <div style={{
  marginTop: '12px',
  maxWidth: '50%',
}}>
  <div>
    <label style={{
      display: 'block',
      fontSize: '12px',
      fontWeight: 500,
      color: '#666',
      marginBottom: '6px'
    }}>
      Payment Method
    </label>

    <select
      value={form.bankAccountId}
      onChange={(e) => {
        if (e.target.value === '__add_new__') {
          setShowPaymentModal(true)
          return
        }

        setForm({
          ...form,
          bankAccountId: e.target.value,
        })
      }}
      style={{
        ...inputStyle,
        background: '#fff',
        cursor: 'pointer'
      }}
    >
      <option value="">Select payment method</option>

      {bankAccounts.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
          {b.bankName ? ` — ${b.bankName}` : ''}
        </option>
      ))}

      <option value="__add_new__">
        + Add Payment Method
      </option>
    </select>
  </div>
</div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e5e5', background: '#fff', color: '#666', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: submitting ? '#666' : '#1a1a1a', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer' }}
              >
                {submitting ? 'Saving...' : 'Save Revenue'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Revenue Table ── */}
      {loading ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>Loading...</div>
      ) : error ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>{error}</div>
      ) : revenues.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>No revenue records found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: 500, borderBottom: '1px solid #e5e5e5' }}>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Project</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Amount</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Received Date</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Payment</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Description</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Created By</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Invoice</th>
              <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {revenues.map((revenue) => (
              <IncomeRow key={revenue.id} revenue={revenue} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default IncomeTable
