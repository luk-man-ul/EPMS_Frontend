import { useState, useEffect } from 'react'
import { getRevenues, createRevenue, getBankAccounts } from '../finance.api'
import type { Revenue, BankAccount } from '../types/finance.types'
import IncomeRow from './IncomeRow'
import { getProjectOptions } from '../lookup.api'
import type { ProjectOption } from '../lookup.api'
import { useToast } from '../../../../context/ToastContext'
import { AddPaymentMethodModal } from './AddPaymentMethodModal'
import { formatCurrency, formatDate } from '../finance.utils'

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

  // ── Filter state ────────────────────────────────────────
  const [filterProject, setFilterProject] = useState('')
  const [filterSearch,  setFilterSearch]  = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  // ── Filtered revenues ───────────────────────────────────
  const filteredRevenues = revenues.filter((r) => {
    const matchProject = !filterProject || r.project?.id === filterProject
    const search = filterSearch.toLowerCase()
    const matchSearch = !search ||
      r.project?.name?.toLowerCase().includes(search) ||
      r.description?.toLowerCase().includes(search)
    return matchProject && matchSearch
  })

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
        <div style={{ padding: isMobile ? '16px' : '24px', borderBottom: '1px solid #e5e5e5', background: '#fafafa' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '12px', alignItems: 'end' }}>

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
              maxWidth: isMobile ? '100%' : '50%',
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
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e5e5', background: '#fff', color: '#666', fontSize: '13px', fontWeight: 500, cursor: 'pointer', flex: isMobile ? 1 : 'none', textAlign: 'center' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: submitting ? '#666' : '#1a1a1a', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', flex: isMobile ? 1 : 'none', textAlign: 'center' }}
              >
                {submitting ? 'Saving...' : 'Save Revenue'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filters ── */}
      {!showForm && (
        <div style={isMobile ? {
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
          borderBottom: '1px solid #e5e5e5',
        } : {
          display: 'flex',
          gap: '10px',
          padding: '16px 20px',
          borderBottom: '1px solid #e5e5e5',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              fontSize: '13px',
              background: '#fff',
              outline: 'none',
              cursor: 'pointer',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by project or description..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              fontSize: '13px',
              outline: 'none',
              width: isMobile ? '100%' : '260px',
              boxSizing: 'border-box',
            }}
          />
          {(filterProject || filterSearch) && (
            <button
              onClick={() => { setFilterProject(''); setFilterSearch('') }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                background: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
                color: '#666',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* ── Revenue Table ── */}
      {loading ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>Loading...</div>
      ) : error ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>{error}</div>
      ) : filteredRevenues.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
          {revenues.length === 0 ? 'No revenue records found.' : 'No records match your filters.'}
        </div>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredRevenues.map((revenue, idx) => (
            <div
              key={revenue.id}
              style={{
                padding: '16px',
                borderBottom: idx < filteredRevenues.length - 1 ? '1px solid #f5f5f5' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>
                    {revenue.project.name}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                      {formatCurrency(revenue.amount)}
                    </span>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>
                      📅 {formatDate(revenue.receivedDate)}
                    </span>
                  </div>
                  {revenue.description && (
                    <div style={{ fontSize: '13px', color: '#555', marginTop: '2px', lineHeight: 1.4 }}>
                      {revenue.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    {revenue.paymentMethod && (
                      <span style={{ fontSize: '11px', fontWeight: 500, color: '#555', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                        💳 {revenue.paymentMethod} {revenue.bankAccount ? `(${revenue.bankAccount.name})` : ''}
                      </span>
                    )}
                    {revenue.invoice && (
                      <span style={{ fontSize: '11px', fontWeight: 500, color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>
                        🧾 {revenue.invoice.invoiceNo}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                    Recorded by {revenue.createdBy.firstName} {revenue.createdBy.lastName}
                  </div>
                </div>
                
                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    style={{ border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', fontSize: '12px', padding: '6px 12px', borderRadius: '8px', color: '#1a1a1a', fontWeight: 500 }}
                  >
                    Edit
                  </button>
                  <button
                    style={{ border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', fontSize: '14px', padding: '6px 10px', borderRadius: '8px', color: '#666' }}
                  >
                    ⋮
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
            {filteredRevenues.map((revenue) => (
              <IncomeRow key={revenue.id} revenue={revenue} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default IncomeTable
