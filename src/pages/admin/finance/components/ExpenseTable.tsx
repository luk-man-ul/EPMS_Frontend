import { useState, useEffect, useMemo } from 'react'
import { getExpenses, createExpense, getBankAccounts, getExpenseCategories } from '../finance.api'
import type { ExpenseRecord, BankAccount, ExpenseCategory } from '../types/finance.types'
import ExpenseRow from './ExpenseRow'
import { getProjectOptions, getEmployeeOptions } from '../lookup.api'
import type { ProjectOption, EmployeeOption } from '../lookup.api'
import { useToast } from '../../../../context/ToastContext'
import { AddPaymentMethodModal } from './AddPaymentMethodModal'
import { AddExpenseCategoryModal } from './AddExpenseCategoryModal'
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
  categoryId:    '',
  amount:        '',
  expenseDate:   '',
  employeeId:    '',
  projectId:     '',
  description:   '',
  bankAccountId: '',
}

const ExpenseTable = ({ showForm = false, onFormClose }: Props) => {
  const { showToast } = useToast()

  // ── Expense list ────────────────────────────────────────
  const [expenses,  setExpenses]  = useState<ExpenseRecord[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  // ── Dropdown data ───────────────────────────────────────
  const [projects,     setProjects]     = useState<ProjectOption[]>([])
  const [employees,    setEmployees]    = useState<EmployeeOption[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [categories,   setCategories]   = useState<ExpenseCategory[]>([])

  // ── Form state ──────────────────────────────────────────
  const [showPaymentModal,  setShowPaymentModal]  = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  const [form,       setForm]       = useState(EMPTY_FORM)
  const [formError,  setFormError]  = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // ── Derived: is the selected category a salary category? ─
  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === form.categoryId),
    [categories, form.categoryId],
  )
  const isSalary = selectedCategory?.name?.toLowerCase() === 'salary'

  // ── Filter state ────────────────────────────────────────
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSearch,   setFilterSearch]   = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  // ── Clear employeeId when switching away from Salary ────
  const handleCategoryChange = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId)
    const newIsSalary = cat?.name?.toLowerCase() === 'salary'
    setForm({ ...form, categoryId, employeeId: newIsSalary ? form.employeeId : '' })
  }

  // ── Form submit ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!form.categoryId)                                   { setFormError('Category is required'); return }
    if (!form.amount || Number(form.amount) <= 0)           { setFormError('Amount must be greater than 0'); return }
    if (!form.expenseDate)                                  { setFormError('Expense date is required'); return }
    if (isSalary && !form.employeeId)                       { setFormError('Employee is required for Salary expenses'); return }

    try {
      setSubmitting(true)
      await createExpense({
        categoryId:    form.categoryId,
        amount:        Number(form.amount),
        expenseDate:   form.expenseDate,
        employeeId:    isSalary ? form.employeeId : undefined,
        projectId:     form.projectId || undefined,
        description:   form.description || undefined,
        bankAccountId: form.bankAccountId || undefined,
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

  // ── Filtered expenses ───────────────────────────────────
  const filteredExpenses = expenses.filter((e) => {
    const matchCategory = !filterCategory || e.category?.id === filterCategory
    const search = filterSearch.toLowerCase()
    const matchSearch = !search ||
      e.category?.name?.toLowerCase().includes(search) ||
      e.description?.toLowerCase().includes(search) ||
      e.employee?.firstName?.toLowerCase().includes(search) ||
      e.employee?.lastName?.toLowerCase().includes(search) ||
      e.project?.name?.toLowerCase().includes(search)
    return matchCategory && matchSearch
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

      {/* ── Add Expense Category Modal ── */}
      {showCategoryModal && (
        <AddExpenseCategoryModal
          onClose={() => setShowCategoryModal(false)}
          onCreated={(newCategory) => {
            setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)))
            setForm((prev) => ({ ...prev, categoryId: newCategory.id }))
            setShowCategoryModal(false)
          }}
        />
      )}

      {/* ── Create Expense Form ── */}
      {showForm && (
        <div style={{ padding: isMobile ? '16px' : '24px', borderBottom: '1px solid #e5e5e5', background: '#fafafa' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
            Add Expense
          </div>

          {formError && (
            <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', background: '#fff5f5', color: '#dc2626', fontSize: '13px' }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Row 1: Category · Amount · Date · Employee (salary) or Project */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>

              {/* Category — required, drives salary logic */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#666', marginBottom: '6px' }}>
                  Category *
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => {
                    if (e.target.value === '__add_category__') {
                      setShowCategoryModal(true)
                      return
                    }
                    handleCategoryChange(e.target.value)
                  }}
                  style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  <option value="__add_category__">+ Add Category</option>
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

              {/* Expense Date */}
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

              {/* Employee (Salary) or Project (other) */}
              {isSalary ? (
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

            {/* Row 2: Payment Method · Bank Account (conditional) · Description */}
            {/* Row 2: Payment Method · Description */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
                gap: '12px',
                marginTop: '12px',
                alignItems: 'end',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#666',
                    marginBottom: '6px',
                  }}
                >
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
                    cursor: 'pointer',
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

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#666',
                    marginBottom: '6px',
                  }}
                >
                  Description
                </label>

                <input
                  type="text"
                  placeholder="Optional note"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  style={inputStyle}
                />
              </div>
            </div>
              
            {/* Project row for Salary (optional project link) */}
            {isSalary && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 3fr', gap: '12px', marginTop: '12px', alignItems: 'end' }}>
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
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e5e5', background: '#fff', color: '#666', fontSize: '13px', fontWeight: 500, cursor: 'pointer', flex: isMobile ? 1 : 'none', textAlign: 'center' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: submitting ? '#666' : '#1a1a1a', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', flex: isMobile ? 1 : 'none', textAlign: 'center' }}
              >
                {submitting ? 'Saving...' : 'Save Expense'}
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
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
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
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by category, employee or project..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              fontSize: '13px',
              outline: 'none',
              width: isMobile ? '100%' : '280px',
              boxSizing: 'border-box',
            }}
          />
          {(filterCategory || filterSearch) && (
            <button
              onClick={() => { setFilterCategory(''); setFilterSearch('') }}
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

      {/* ── Expense Table ── */}
      {loading ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>Loading...</div>
      ) : error ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>{error}</div>
      ) : filteredExpenses.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
          {expenses.length === 0 ? 'No expense records found.' : 'No records match your filters.'}
        </div>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredExpenses.map((expense, idx) => {
            const employeeLabel = expense.employee
              ? `${expense.employee.firstName} ${expense.employee.lastName}`
              : null
            const projectLabel = expense.project?.name ?? null
            const isSal = expense.category.name.toLowerCase() === 'salary'

            return (
              <div
                key={expense.id}
                style={{
                  padding: '16px',
                  borderBottom: idx < filteredExpenses.length - 1 ? '1px solid #f5f5f5' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '5px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: isSal ? '#eff6ff' : '#f0fdf4',
                        color: isSal ? '#2563eb' : '#16a34a',
                      }}>
                        {expense.category.name}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
                        {formatCurrency(expense.amount)}
                      </span>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        📅 {formatDate(expense.expenseDate)}
                      </span>
                    </div>
                    
                    {(employeeLabel || projectLabel) && (
                      <div style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 500 }}>
                        {employeeLabel && `Employee: ${employeeLabel}`}
                        {employeeLabel && projectLabel && ' · '}
                        {projectLabel && `Project: ${projectLabel}`}
                      </div>
                    )}

                    {expense.description && (
                      <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.4 }}>
                        {expense.description}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                      {expense.paymentMethod && (
                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#555', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                          💳 {expense.paymentMethod} {expense.bankAccount ? `(${expense.bankAccount.name})` : ''}
                        </span>
                      )}
                      <span style={{ fontSize: '11px', color: '#999' }}>
                        Recorded by {expense.createdBy.firstName} {expense.createdBy.lastName}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      style={{ border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', fontSize: '12px', padding: '6px 12px', borderRadius: '8px', color: '#1a1a1a', fontWeight: 500 }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: 500, borderBottom: '1px solid #e5e5e5' }}>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Category</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Amount</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Expense Date</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Employee / Project</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Payment</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Description</th>
              <th style={{ padding: '16px 20px', fontWeight: 500 }}>Created By</th>
              <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ExpenseTable
