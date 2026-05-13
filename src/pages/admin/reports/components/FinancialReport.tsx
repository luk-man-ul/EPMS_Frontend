/**
 * FinancialAnalyticsReport
 *
 * Unified financial analytics section combining what were previously two
 * separate tabs: "Financial Reports" and "Profit & Loss".
 *
 * Current state: live data is surfaced via the Finance module. This component
 * provides a structured entry point with clear navigation and is architected
 * to accept real data props / sub-sections as the finance reporting layer matures.
 *
 * Future extension points (marked with TODO):
 *   - Monthly revenue/expense trend chart
 *   - Per-project P&L breakdown table
 *   - Invoice status summary
 *   - Payroll cost analytics
 *   - Export (CSV / PDF)
 */

import { useState, useEffect } from 'react'
import api from '../../../../utils/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FinanceSummary {
  totalRevenue: number
  totalExpense: number
  profit: number
}

interface ProjectProfit {
  projectId: string
  projectName: string
  revenue: number
  expense: number
  profit: number
  profitMargin: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number): string => {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n.toLocaleString()}`
}

const fmtPct = (n: number): string => `${n.toFixed(1)}%`

// ─── Component ────────────────────────────────────────────────────────────────

const FinancialAnalyticsReport = () => {
  const [summary, setSummary]         = useState<FinanceSummary | null>(null)
  const [projects, setProjects]       = useState<ProjectProfit[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [summaryRes, projectsRes] = await Promise.all([
          api.get('/finance/summary'),
          api.get('/finance/projects/summary'),
        ])
        setSummary(summaryRes.data)
        setProjects(projectsRes.data.projects ?? [])
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load financial data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
        Loading financial data...
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ padding: '24px', background: '#fef2f2', borderRadius: '12px', color: '#dc2626', fontSize: '14px' }}>
        {error}
      </div>
    )
  }

  const profitMarginOverall = summary && summary.totalRevenue > 0
    ? (summary.profit / summary.totalRevenue) * 100
    : 0

  return (
    <div>
      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      {summary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {/* Total Revenue */}
          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Total Revenue</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a' }}>
              {fmt(summary.totalRevenue)}
            </div>
          </div>

          {/* Total Expenses */}
          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Total Expenses</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a' }}>
              {fmt(summary.totalExpense)}
            </div>
          </div>

          {/* Net Profit */}
          <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Net Profit</div>
            <div style={{
              fontSize: '28px',
              fontWeight: 700,
              color: summary.profit >= 0 ? '#4ade80' : '#f87171',
            }}>
              {fmt(summary.profit)}
            </div>
          </div>

          {/* Profit Margin */}
          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Profit Margin</div>
            <div style={{
              fontSize: '28px',
              fontWeight: 700,
              color: profitMarginOverall >= 0 ? '#1a1a1a' : '#dc2626',
            }}>
              {fmtPct(profitMarginOverall)}
            </div>
          </div>
        </div>
      )}

      {/* ── Project P&L Table ─────────────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid #e5e5e5',
          background: '#fafafa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
            Project Profitability
          </h3>
          <a
            href="/admin/finance"
            style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 500, textDecoration: 'none' }}
          >
            Open Finance module →
          </a>
        </div>

        {projects.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            No project financial data yet. Add revenue and expense records in the{' '}
            <a href="/admin/finance" style={{ color: '#1a1a1a', fontWeight: 600 }}>Finance module</a>.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e5e5', background: '#fafafa' }}>
                {['Project', 'Revenue', 'Expenses', 'Net Profit', 'Margin'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr
                  key={p.projectId}
                  style={{ borderBottom: '1px solid #f5f5f5' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>
                    {p.projectName}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#374151' }}>
                    {fmt(p.revenue)}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#374151' }}>
                    {fmt(p.expense)}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, color: p.profit >= 0 ? '#16a34a' : '#dc2626' }}>
                    {fmt(p.profit)}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: p.profitMargin >= 0 ? '#16a34a' : '#dc2626' }}>
                    {fmtPct(p.profitMargin)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Future extension placeholder ──────────────────────────────────── */}
      {/* TODO: Monthly revenue/expense trend chart */}
      {/* TODO: Invoice status summary (PAID / SENT / OVERDUE) */}
      {/* TODO: Payroll cost analytics (GET /finance/employees/summary) */}
      {/* TODO: Date range filter (month picker) */}
      {/* TODO: Export CSV / PDF */}
    </div>
  )
}

export default FinancialAnalyticsReport
