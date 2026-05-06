import { useState, useEffect } from 'react'
import { getExpenses, createExpense, getBankAccounts, getExpenseCategories } from '../finance.api'
import type { ExpenseRecord, BankAccount, ExpenseCategory } from '../types/finance.types'
import ExpenseRow from './ExpenseRow'
import { getProjectOptions, getEmployeeOptions } from '../lookup.api'
import type { ProjectOption, EmployeeOption } from '../lookup.api'
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

const EMPTY_FORM = {
  type: 'MANUAL' as 'SALARY' | 'MANUAL',
  amount: '',
  expenseDate: '',
  employeeId: '',
  projectId: '',
  description: '',
  paymentMethod: '' as '' | 'CASH' | 'ONLINE',
  bankAccountId: '',
  categoryId: '',
}

const ExpenseTable = ({ showForm = false, onFormClose }: Props) => {
  const { showToast } = useToast()

  // ── Expense list ────────────────────────────────────────
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Dropdown data ───────────────────────────────────────
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])

  // ── Form state ──────────────────────────────────────────
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // ── Fetch expenses ──────────────────────────────────────
  const fetchExpenses = () => {
    setLoading(true)
    setError(null)
    getExpenses()
      .then(setExpenses)
      .catch((err: any) => setError(err.response?.data?.message || 'Failed to load expenses'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchExpenses() }, [])

  // ── Fetch dropdowns ─────────────────────────────────────
  useEffect(() => {
    getProjectOptions().then(setProjects).catch(() => {})
    getEmployeeOptions().then(setEmployees).catch(() => {})
    getBankAccounts().then(setBankAccounts).catch(() => {})
    getExpenseCategories().then(setCategories).catch(() => {})
  }, [])

  // ── Clear employeeId when switching away from SALARY ────
  const handleTypeChange = (type: 'SALARY' | 'MANUAL') => {
    setForm({ ...form, type, employeeId: '' })
  }

  // ── Clear bankAccountId when switching away from ONLINE ─
  const handlePaymentMethodChange = (method: '' | 'CASH' | 'ONLINE') => {
    setForm({ ...form, paymentMethod: method, bankAccountId: method === 'ONLINE' ? form.bankAccountId : '' })
  }

  // ── Form submit ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!form.amount || Number(form.amount) <= 0)          { setFormError('Amount must be greater than 0'); return }
    if (!form.expenseDate)                                  { setFormError('Expense date is required'); return }
    if (form.type === 'SALARY' && !form.employeeId)         { setFormError('Employee is required for salary expenses'); return }

    try {
      setSubmitting(true)
      await createExpense({
        type:          form.type,
        amount:        Number(form.amount),
        expenseDate:   form.expenseDate,
        employeeId:    form.type === 'SALARY' ? form.employeeId : undefined,
        projectId:     form.projectId || undefined,
        description:   form.description || undefined,
        paymentMethod: form.paymentMethod || undefined,
        bankAccountId: form.paymentMethod === 'ONLINE' && form.bankAccountId ? form.bankAccountId : undefined,
        categoryId:    form.categoryId || undefined,
      })
      showToast('success', 'Expense record created')
      setForm(EMPTY_FORM)
      onFormClose?.()
      fetchExpenses()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to create expense')
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
      {/* ── Create Expense Form ── */}
      {showForm && (
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e5e5', background: '#fafafa' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
            Add Expense
          </div>

          {formError && (
            <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', background: '#fff5f5', color: '#dc2626', fontSize: '13px' }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Row 1: Type · Amount · Date · Employee/Project */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                  Type *
                </label>
                <select
                  value={form.type}
                  onChange={(e) => handleTypeChange(e.target.value as 'SALARY' | 'MANUAL')}
                  style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}
                >
                  <option value="MANUAL">Manual</option>
                  <option value="SALARY">Salary</option>
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
                  Expense Date *
                </label>
                <input
                  type="date"
                  value={form.expenseDate}
                  onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Employee (SALARY) or Project (MANUAL) */}
              {form.type === 'SALARY' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                    Employee *
                  </label>
                  <select
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                    Project
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
              )}
            </div>

            {/* Row 2: Category · Payment Method · Bank Account (conditional) · Description */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: '12px', marginTop: '12px', alignItems: 'end' }}>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                  Payment Method
                </label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => handlePaymentMethodChange(e.target.value as '' | 'CASH' | 'ONLINE')}
                  style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}
                >
                  <option value="">Not specified</option>
                  <option value="CASH">Cash</option>
                  <option value="ONLINE">Online</option>
                </select>
              </div>

              {/* Bank account — only shown when ONLINE */}
              {form.paymentMethod === 'ONLINE' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                    Bank Account
                  </label>
                  <select
                    value={form.bankAccountId}
                    onChange={(e) => setForm({ ...form, bankAccountId: e.target.value })}
                    style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}
                  >
                    <option value="">Select bank account</option>
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} — {b.bankName}</option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Empty placeholder to keep description in the last column */
                <div />
              )}

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

            {/* Project row for SALARY type (project is optional but available) */}
            {form.type === 'SALARY' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '12px', marginTop: '12px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                    Project
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
              </div>
            )}

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
                {submitting ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Expense Table ── */}
      {loading ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>Loading...</div>
      ) : error ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>{error}</div>
      ) : expenses.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>No expense records found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: 500, borderBottom: '1px solid #e5e5e5' }}>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Type</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Amount</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Expense Date</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Employee / Project</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Category</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Payment</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Description</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Created By</th>
              <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ExpenseTable
