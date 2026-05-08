import { useState, useEffect } from 'react'
import {
  getAllProjectsProfit,
  getProjectProfit,
  getRevenues,
  getExpenses,
} from '../finance.api'
import type {
  AllProjectsProfitData,
  ProjectProfitData,
  ProjectProfitSummary,
} from '../finance.api'
import type { Revenue, ExpenseRecord } from '../types/finance.types'
import { formatCurrency } from '../finance.utils'
import FinanceStatCard from './FinanceStatCard'
import IncomeRow from './IncomeRow'
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

// ── Section header for transaction tables ─────────────────────────────────────
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

// ── Empty state for transaction tables ────────────────────────────────────────
const TableEmpty = ({ message }: { message: string }) => (
  <div style={{ padding: '24px', textAlign: 'center', color: '#bbb', fontSize: '13px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
    {message}
  </div>
)

// ── Inline loading for transaction tables ─────────────────────────────────────
const TableLoading = () => (
  <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
    Loading records...
  </div>
)

const ProjectProfit = () => {
  // ── Aggregate state (loaded once on mount) ────────────────────────────────
  const [aggregate, setAggregate] = useState<AllProjectsProfitData | null>(null)
  const [aggLoading, setAggLoading] = useState(true)
  const [aggError, setAggError] = useState<string | null>(null)

  // ── Drill-down summary state ──────────────────────────────────────────────
  const [selectedProject, setSelectedProject] = useState<ProjectProfitSummary | null>(null)
  const [drillData, setDrillData] = useState<ProjectProfitData | null>(null)
  const [drillLoading, setDrillLoading] = useState(false)
  const [drillError, setDrillError] = useState<string | null>(null)

  // ── Drill-down transaction state ──────────────────────────────────────────
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [txLoading, setTxLoading] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)

  // ── Load aggregate once on mount ──────────────────────────────────────────
  useEffect(() => {
    setAggLoading(true)
    getAllProjectsProfit()
      .then(setAggregate)
      .catch((err: any) =>
        setAggError(err.response?.data?.message || 'Failed to load project summary')
      )
      .finally(() => setAggLoading(false))
  }, [])

  // ── Load drill-down data when a project is selected ───────────────────────
  // Fetches summary + transactions in parallel
  useEffect(() => {
    if (!selectedProject) {
      setDrillData(null)
      setRevenues([])
      setExpenses([])
      return
    }

    const projectId = selectedProject.projectId

    // Summary cards
    setDrillLoading(true)
    setDrillError(null)
    getProjectProfit(projectId)
      .then(setDrillData)
      .catch((err: any) =>
        setDrillError(err.response?.data?.message || 'Failed to load project profit')
      )
      .finally(() => setDrillLoading(false))

    // Transaction records — fetched in parallel
    setTxLoading(true)
    setTxError(null)
    Promise.all([
      getRevenues({ projectId }),
      getExpenses({ projectId }),
    ])
      .then(([revs, exps]) => {
        setRevenues(revs)
        setExpenses(exps)
      })
      .catch((err: any) =>
        setTxError(err.response?.data?.message || 'Failed to load transaction records')
      )
      .finally(() => setTxLoading(false))
  }, [selectedProject])

  const handleSelectProject = (summary: ProjectProfitSummary) => {
    setSelectedProject(summary)
  }

  const handleBack = () => {
    setSelectedProject(null)
    setDrillData(null)
    setDrillError(null)
    setRevenues([])
    setExpenses([])
    setTxError(null)
  }

  // ── Drill-down view ───────────────────────────────────────────────────────
  if (selectedProject) {
    const profitMargin =
      drillData && drillData.revenue > 0
        ? ((drillData.profit / drillData.revenue) * 100).toFixed(1)
        : null

    return (
      <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={handleBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#666', padding: 0, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}
          >
            ← Back to All Projects
          </button>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
            {selectedProject.projectName}
          </div>
          <div style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>Project financial breakdown</div>
        </div>

        {/* Summary cards */}
        {drillLoading && (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#999', fontSize: '14px' }}>Loading summary...</div>
        )}
        {!drillLoading && drillError && (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>{drillError}</div>
        )}
        {!drillLoading && !drillError && drillData && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${profitMargin !== null ? 4 : 3}, 1fr)`, gap: '16px' }}>
            <FinanceStatCard label="Revenue" value={formatCurrency(drillData.revenue)} subtext="Total received" />
            <FinanceStatCard label="Expense" value={formatCurrency(drillData.expense)} subtext="Total spent" valueColor="#666" />
            <FinanceStatCard
              label="Profit"
              value={formatCurrency(drillData.profit)}
              subtext={drillData.profit >= 0 ? 'Positive balance' : 'Negative balance'}
              bgColor={drillData.profit >= 0 ? '#1a1a1a' : '#dc2626'}
            />
            {profitMargin !== null && (
              <FinanceStatCard label="Margin" value={`${profitMargin}%`} subtext={Number(profitMargin) >= 20 ? 'Healthy' : 'Below target'} />
            )}
          </div>
        )}

        {/* Transaction error */}
        {txError && (
          <div style={{ marginTop: '20px', padding: '12px 16px', borderRadius: '8px', background: '#fff5f5', color: '#dc2626', fontSize: '13px' }}>
            {txError}
          </div>
        )}

        {/* ── Revenue Records ── */}
        <SectionHeader title="Revenue Records" count={txLoading ? undefined : revenues.length} />
        {txLoading ? (
          <TableLoading />
        ) : revenues.length === 0 ? (
          <TableEmpty message="No revenue records for this project yet." />
        ) : (
          <div style={{ border: '1px solid #e5e5e5', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: 500 }}>
                  {/* Project column hidden — we're already in project context */}
                  <th style={th}>Amount</th>
                  <th style={th}>Received Date</th>
                  <th style={th}>Payment</th>
                  <th style={th}>Description</th>
                  <th style={th}>Created By</th>
                  <th style={th}>Invoice</th>
                  {/* Actions column hidden — read-only */}
                </tr>
              </thead>
              <tbody>
                {revenues.map((rev) => (
                  <IncomeRow
                    key={rev.id}
                    revenue={rev}
                    hideProject
                    readOnly
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Expense Records ── */}
        <SectionHeader title="Expense Records" count={txLoading ? undefined : expenses.length} />
        {txLoading ? (
          <TableLoading />
        ) : expenses.length === 0 ? (
          <TableEmpty message="No expense records for this project yet." />
        ) : (
          <div style={{ border: '1px solid #e5e5e5', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: 500 }}>
                  <th style={th}>Category</th>
                  <th style={th}>Amount</th>
                  <th style={th}>Expense Date</th>
                  <th style={th}>Employee</th>
                  {/* Project column hidden — we're already in project context */}
                  <th style={th}>Payment</th>
                  <th style={th}>Description</th>
                  <th style={th}>Created By</th>
                  {/* Actions column hidden — read-only */}
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <ExpenseRow
                    key={exp.id}
                    expense={exp}
                    hideProject
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
      <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>Project Profit</div>
      <div style={{ fontSize: '13px', color: '#999', marginBottom: '24px' }}>All projects ranked by profitability</div>

      {aggLoading && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#999', fontSize: '14px' }}>Loading...</div>
      )}
      {!aggLoading && aggError && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>{aggError}</div>
      )}
      {!aggLoading && !aggError && aggregate && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <FinanceStatCard label="Total Revenue" value={formatCurrency(aggregate.totalRevenue)} subtext="Across all projects" />
            <FinanceStatCard label="Total Expense" value={formatCurrency(aggregate.totalExpense)} subtext="Across all projects" valueColor="#666" />
            <FinanceStatCard
              label="Total Profit"
              value={formatCurrency(aggregate.totalProfit)}
              subtext={aggregate.totalProfit >= 0 ? 'Positive balance' : 'Negative balance'}
              bgColor={aggregate.totalProfit >= 0 ? '#1a1a1a' : '#dc2626'}
              isNegative={aggregate.totalProfit < 0}
            />
            {aggregate.topProject && (
              <FinanceStatCard
                label="Top Project"
                value={aggregate.topProject.projectName}
                subtext={`${formatCurrency(aggregate.topProject.profit)} profit`}
              />
            )}
          </div>

          {aggregate.projects.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#bbb', fontSize: '14px' }}>
              No project financial data yet.
            </div>
          ) : (
            <div style={{ border: '1px solid #e5e5e5', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...th, width: 48 }}>#</th>
                    <th style={th}>Project</th>
                    <th style={{ ...th, textAlign: 'right' }}>Revenue</th>
                    <th style={{ ...th, textAlign: 'right' }}>Expense</th>
                    <th style={{ ...th, textAlign: 'right' }}>Profit</th>
                    <th style={{ ...th, textAlign: 'right' }}>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregate.projects.map((p, idx) => (
                    <tr
                      key={p.projectId}
                      onClick={() => handleSelectProject(p)}
                      style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ ...td, color: '#999', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ ...td, fontWeight: 500 }}>{p.projectName}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{formatCurrency(p.revenue)}</td>
                      <td style={{ ...td, textAlign: 'right', color: '#666' }}>{formatCurrency(p.expense)}</td>
                      <td style={{ ...td, textAlign: 'right', fontWeight: 600, color: p.profit >= 0 ? '#1a1a1a' : '#dc2626' }}>
                        {formatCurrency(p.profit)}
                      </td>
                      <td style={{ ...td, textAlign: 'right', color: p.profitMargin >= 20 ? '#16a34a' : p.profitMargin > 0 ? '#d97706' : '#dc2626' }}>
                        {p.revenue > 0 ? `${p.profitMargin}%` : '—'}
                      </td>
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

export default ProjectProfit
