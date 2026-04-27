import { useState, useEffect } from 'react'
import { getRevenues, createRevenue } from '../finance.api'
import type { Revenue } from '../types/finance.types'
import IncomeRow from './IncomeRow'
import { getProjectOptions } from '../lookup.api'
import type { ProjectOption } from '../lookup.api'
import { useToast } from '../../../../context/ToastContext'

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

const IncomeTable = ({ showForm = false, onFormClose }: Props) => {
  const { showToast } = useToast()

  // ── Revenue list state ──────────────────────────────────
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Projects dropdown ───────────────────────────────────
  const [projects, setProjects] = useState<ProjectOption[]>([])

  // ── Form state ──────────────────────────────────────────
  const [form, setForm] = useState({ projectId: '', amount: '', receivedDate: '', description: '' })
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

  // ── Fetch projects for dropdown ─────────────────────────
  useEffect(() => {
    getProjectOptions()
      .then(setProjects)
      .catch(() => {})
  }, [])

  // ── Form submit ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!form.projectId) { setFormError('Project is required'); return }
    if (!form.amount || Number(form.amount) <= 0) { setFormError('Amount must be greater than 0'); return }
    if (!form.receivedDate) { setFormError('Received date is required'); return }

    try {
      setSubmitting(true)
      await createRevenue({
        projectId: form.projectId,
        amount: Number(form.amount),
        receivedDate: form.receivedDate,
        description: form.description || undefined,
      })
      showToast('success', 'Revenue record created')
      setForm({ projectId: '', amount: '', receivedDate: '', description: '' })
      onFormClose?.()
      fetchRevenues()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to create revenue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setForm({ projectId: '', amount: '', receivedDate: '', description: '' })
    setFormError(null)
    onFormClose?.()
  }

  return (
    <div>
      {/* ── Create Revenue Form ── */}
      {showForm && (
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e5e5',
          background: '#fafafa',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
            Add Revenue
          </div>

          {formError && (
            <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', background: '#fff5f5', color: '#dc2626', fontSize: '13px' }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: '12px', alignItems: 'end' }}>

              {/* Project */}
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

              {/* Amount */}
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

              {/* Received Date */}
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

              {/* Description */}
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

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e5e5',
                  background: '#fff', color: '#666', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  background: submitting ? '#666' : '#1a1a1a', color: '#fff',
                  fontSize: '13px', fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Saving...' : 'Save Revenue'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Revenue Table ── */}
      {loading ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
          Loading...
        </div>
      ) : error ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>
          {error}
        </div>
      ) : revenues.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
          No revenue records found.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: 500, borderBottom: '1px solid #e5e5e5' }}>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Project</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Amount</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Received Date</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Description</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Created By</th>
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
