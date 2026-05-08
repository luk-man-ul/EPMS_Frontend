import { useState, useEffect } from 'react'
import {
  getAllEmployeesCost,
  getEmployeeCost,
  getExpenses,
} from '../finance.api'
import type {
  AllEmployeesCostData,
  EmployeeCostData,
  EmployeeCostSummary,
} from '../finance.api'
import type { ExpenseRecord } from '../types/finance.types'
import { formatCurrency } from '../finance.utils'
import FinanceStatCard from './FinanceStatCard'
import ExpenseRow from './ExpenseRow'

// ── Shared table styles ───────────────────────────────────────────────────────
const td: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: '14px',
  color: '#1a1a1a',
  borderBottom: '1px solid #f5f5f5',
}
const th: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '12px',
  fontWeight: 500,
  color: '#666',
  textAlign: 'left',
  borderBottom: '1px solid #e5e5e5',
  background: '#fafafa',
}

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, count }: { title: string; count?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', marginTop: '28px' }}>
    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{title}</div>
    {count !== undefined && (
      <span style={{ fontSize: '12px', color: '#999', background: '#f5f5f5', padding: '2px 8px', borderRadius: '10px' }}>
        {count}
      </span>
    )}
  </div>
)

// ── Empty state ───────────────────────────────────────────────────────────────
const TableEmpty = ({ message }: { message: string }) => (
  <div style={{ padding: '24px', textAlign: 'center', color: '#bbb', fontSize: '13px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
    {message}
  </div>
)

// ── Inline loading ────────────────────────────────────────────────────────────
const TableLoading = () => (
  <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
    Loading records...
  </div>
)

const EmployeeCost = () => {
  // ── Aggregate state (loaded once on mount) ────────────────────────────────
  const [aggregate, setAggregate] = useState<AllEmployeesCostData | null>(null)
  const [aggLoading, setAggLoading] = useState(true)
  const [aggError, setAggError] = useState<string | null>(null)

  // ── Drill-down summary state ──────────────────────────────────────────────
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeCostSummary | null>(null)
  const [drillData, setDrillData] = useState<EmployeeCostData | null>(null)
  const [drillLoading, setDrillLoading] = useState(false)
  const [drillError, setDrillError] = useState<string | null>(null)

  // ── Drill-down transaction state ──────────────────────────────────────────
  const [salaryExpenses, setSalaryExpenses] = useState<ExpenseRecord[]>([])
  const [txLoading, setTxLoading] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)

  // ── Load aggregate once on mount ──────────────────────────────────────────
  useEffect(() => {
    setAggLoading(true)
    getAllEmployeesCost()
      .then(setAggregate)
      .catch((err: any) =>
        setAggError(err.response?.data?.message || 'Failed to load employee summary')
      )
      .finally(() => setAggLoading(false))
  }, [])

  // ── Load drill-down data when an employee is selected ─────────────────────
  // Fetches summary + transactions in parallel
  useEffect(() => {
    if (!selectedEmployee) {
      setDrillData(null)
      setSalaryExpenses([])
      return
    }

    const employeeId = selectedEmployee.employeeId

    // Summary card
    setDrillLoading(true)
    setDrillError(null)
    getEmployeeCost(employeeId)
      .then(setDrillData)
      .catch((err: any) =>
        setDrillError(err.response?.data?.message || 'Failed to load employee cost')
      )
      .finally(() => setDrillLoading(false))

    // Salary expense records — fetched in parallel with summary
    setTxLoading(true)
    setTxError(null)
    getExpenses({ employeeId })
      .then((exps) => {
        // Filter to Salary-category only (backend may return all employee expenses)
        const salaryOnly = exps.filter(
          (e) => e.category.name.toLowerCase() === 'salary'
        )
        setSalaryExpenses(salaryOnly)
      })
      .catch((err: any) =>
        setTxError(err.response?.data?.message || 'Failed to load salary records')
      )
      .finally(() => setTxLoading(false))
  }, [selectedEmployee])

  const handleSelectEmployee = (summary: EmployeeCostSummary) => {
    setSelectedEmployee(summary)
  }

  const handleBack = () => {
    setSelectedEmployee(null)
    setDrillData(null)
    setDrillError(null)
    setSalaryExpenses([])
    setTxError(null)
  }

  // ── Drill-down view ───────────────────────────────────────────────────────
  if (selectedEmployee) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={handleBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#666', padding: 0, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}
          >
            ← Back to All Employees
          </button>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
            {selectedEmployee.employeeName}
          </div>
          <div style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>Employee salary cost breakdown</div>
        </div>

        {/* Summary cards */}
        {drillLoading && (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#999', fontSize: '14px' }}>Loading summary...</div>
        )}
        {!drillLoading && drillError && (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>{drillError}</div>
        )}
        {!drillLoading && !drillError && drillData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <FinanceStatCard
              label="Total Salary Cost"
              value={formatCurrency(drillData.totalSalary)}
              subtext="All Salary-category expenses"
              bgColor="#1a1a1a"
            />
            <FinanceStatCard
              label="Employee"
              value={selectedEmployee.employeeName}
              subtext={
                drillData.totalSalary === 0
                  ? 'No salary records found'
                  : `${selectedEmployee.salaryCount} salary record${selectedEmployee.salaryCount !== 1 ? 's' : ''}`
              }
            />
          </div>
        )}

        {/* Transaction error */}
        {txError && (
          <div style={{ marginTop: '20px', padding: '12px 16px', borderRadius: '8px', background: '#fff5f5', color: '#dc2626', fontSize: '13px' }}>
            {txError}
          </div>
        )}

        {/* ── Salary Records ── */}
        <SectionHeader title="Salary Records" count={txLoading ? undefined : salaryExpenses.length} />
        {txLoading ? (
          <TableLoading />
        ) : salaryExpenses.length === 0 ? (
          <TableEmpty message="No salary expense records found for this employee." />
        ) : (
          <div style={{ border: '1px solid #e5e5e5', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: 500 }}>
                  <th style={th}>Category</th>
                  <th style={th}>Amount</th>
                  <th style={th}>Expense Date</th>
                  <th style={th}>Project</th>
                  {/* Employee column hidden — we're already in employee context */}
                  <th style={th}>Payment</th>
                  <th style={th}>Description</th>
                  <th style={th}>Created By</th>
                  {/* Actions column hidden — read-only */}
                </tr>
              </thead>
              <tbody>
                {salaryExpenses.map((exp) => (
                  <ExpenseRow
                    key={exp.id}
                    expense={exp}
                    hideEmployee
                    readOnly
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  // ── Aggregate dashboard view ──────────────────────────────────────────────
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '24px' }}>
      <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>Employee Salary Cost</div>
      <div style={{ fontSize: '13px', color: '#999', marginBottom: '24px' }}>All employees ranked by total salary</div>

      {aggLoading && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#999', fontSize: '14px' }}>Loading...</div>
      )}
      {!aggLoading && aggError && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>{aggError}</div>
      )}
      {!aggLoading && !aggError && aggregate && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <FinanceStatCard label="Total Payroll" value={formatCurrency(aggregate.totalPayroll)} subtext="All salary expenses" bgColor="#1a1a1a" />
            <FinanceStatCard label="Employees" value={String(aggregate.employeeCount)} subtext="With salary records" />
            {aggregate.topEarner && (
              <FinanceStatCard label="Top Earner" value={aggregate.topEarner.employeeName} subtext={formatCurrency(aggregate.topEarner.totalSalary)} />
            )}
          </div>

          {aggregate.employees.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#bbb', fontSize: '14px' }}>
              No salary expense records yet.
            </div>
          ) : (
            <div style={{ border: '1px solid #e5e5e5', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...th, width: 48 }}>#</th>
                    <th style={th}>Employee</th>
                    <th style={{ ...th, textAlign: 'right' }}>Total Salary</th>
                    <th style={{ ...th, textAlign: 'right' }}>Records</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregate.employees.map((e, idx) => (
                    <tr
                      key={e.employeeId}
                      onClick={() => handleSelectEmployee(e)}
                      style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                      onMouseEnter={(ev) => (ev.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ ...td, color: '#999', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ ...td, fontWeight: 500 }}>{e.employeeName}</td>
                      <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(e.totalSalary)}</td>
                      <td style={{ ...td, textAlign: 'right', color: '#666' }}>{e.salaryCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default EmployeeCost
