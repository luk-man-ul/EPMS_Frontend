import { useState, useEffect } from 'react'
import {
  getAllProjectsProfit,
  getProjectProfit,
} from '../finance.api'
import type {
  AllProjectsProfitData,
  ProjectProfitData,
  ProjectProfitSummary,
} from '../finance.api'
import { formatCurrency } from '../finance.utils'
import FinanceStatCard from './FinanceStatCard'

// ── Shared table cell style ───────────────────────────────────────────────────
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

const ProjectProfit = () => {
  // ── Aggregate state (loaded once on mount) ────────────────────────────────
  const [aggregate, setAggregate] = useState<AllProjectsProfitData | null>(null)
  const [aggLoading, setAggLoading] = useState(true)
  const [aggError, setAggError] = useState<string | null>(null)

  // ── Drill-down state (loaded when a project is selected) ──────────────────
  const [selectedProject, setSelectedProject] = useState<ProjectProfitSummary | null>(null)
  const [drillData, setDrillData] = useState<ProjectProfitData | null>(null)
  const [drillLoading, setDrillLoading] = useState(false)
  const [drillError, setDrillError] = useState<string | null>(null)

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

  // ── Load drill-down when a project is selected ────────────────────────────
  useEffect(() => {
    if (!selectedProject) { setDrillData(null); return }

    setDrillLoading(true)
    setDrillError(null)
    getProjectProfit(selectedProject.projectId)
      .then(setDrillData)
      .catch((err: any) =>
        setDrillError(err.response?.data?.message || 'Failed to load project profit')
      )
      .finally(() => setDrillLoading(false))
  }, [selectedProject])

  const handleSelectProject = (summary: ProjectProfitSummary) => {
    setSelectedProject(summary)
  }

  const handleBack = () => {
    setSelectedProject(null)
    setDrillData(null)
    setDrillError(null)
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
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
        </div>

        {drillLoading && (
          <div style={{ padding: '32px 0', textAlign: 'center', color: '#999', fontSize: '14px' }}>Loading...</div>
        )}
        {!drillLoading && drillError && (
          <div style={{ padding: '32px 0', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>{drillError}</div>
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
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <FinanceStatCard
              label="Total Revenue"
              value={formatCurrency(aggregate.totalRevenue)}
              subtext="Across all projects"
            />
            <FinanceStatCard
              label="Total Expense"
              value={formatCurrency(aggregate.totalExpense)}
              subtext="Across all projects"
              valueColor="#666"
            />
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

          {/* Project ranking table */}
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
