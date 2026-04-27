import { useState, useEffect } from 'react'
import { getFinanceSummary } from '../finance.api'
import type { FinanceSummaryData } from '../finance.api'
import { formatCurrency } from '../finance.utils'

const FinanceDashboard = () => {
  const [summary, setSummary] = useState<FinanceSummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getFinanceSummary()
      .then(setSummary)
      .catch((err: any) => setError(err.response?.data?.message || 'Failed to load summary'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '48px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
        Loading...
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div style={{ padding: '48px 20px', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>
        {error || 'No data available'}
      </div>
    )
  }

  const { totalRevenue, totalExpense, profit } = summary

  const profitMargin = totalRevenue > 0
    ? ((profit / totalRevenue) * 100).toFixed(1)
    : '0.0'

  const expenseRatio = totalRevenue > 0
    ? Math.min((totalExpense / totalRevenue) * 100, 100)
    : 0

  const cards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      subtext: 'All time revenue',
      color: '#1a1a1a',
      bgColor: '#fff',
    },
    {
      label: 'Total Expense',
      value: formatCurrency(totalExpense),
      subtext: 'All time expenses',
      color: '#666',
      bgColor: '#fff',
    },
    {
      label: 'Net Profit',
      value: formatCurrency(profit),
      subtext: profit >= 0 ? 'Positive balance' : 'Negative balance',
      color: '#666',
      bgColor: '#fff',
    },
    {
      label: 'Profit Margin',
      value: `${profitMargin}%`,
      subtext: Number(profitMargin) >= 20 ? 'Healthy margin' : 'Below target',
      color: '#fff',
      bgColor: '#1a1a1a',
    },
  ]

  return (
    <div>
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {cards.map((card, index) => (
          <div
            key={index}
            style={{
              background: card.bgColor,
              border: card.bgColor === '#fff' ? '1px solid #e5e5e5' : 'none',
              borderRadius: '12px',
              padding: '24px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (card.bgColor === '#fff') {
                e.currentTarget.style.borderColor = '#d4d4d4'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
              }
            }}
            onMouseLeave={(e) => {
              if (card.bgColor === '#fff') {
                e.currentTarget.style.borderColor = '#e5e5e5'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            <div style={{ fontSize: '13px', color: card.bgColor === '#fff' ? '#666' : '#999', marginBottom: '8px' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '32px', fontWeight: 600, color: card.color, letterSpacing: '-0.02em', marginBottom: '8px' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '12px', color: card.bgColor === '#fff' ? '#999' : '#ccc' }}>
              {card.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {/* Revenue Breakdown */}
        <div style={{
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '20px' }}>
            Revenue Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Total Revenue</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                  ${totalRevenue.toLocaleString()}
                </span>
              </div>
              <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', background: '#1a1a1a', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Total Expense</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#666' }}>
                  ${totalExpense.toLocaleString()}
                </span>
              </div>
              <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${expenseRatio}%`,
                  background: '#666',
                  borderRadius: '4px',
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Net Profit</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: profit >= 0 ? '#1a1a1a' : '#dc2626' }}>
                  ${profit.toLocaleString()}
                </span>
              </div>
              <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: totalRevenue > 0 ? `${Math.max(0, (profit / totalRevenue) * 100)}%` : '0%',
                  background: profit >= 0 ? '#1a1a1a' : '#dc2626',
                  borderRadius: '4px',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Profit Summary */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '12px',
          padding: '24px',
          color: '#fff',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
            Profit Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>
                Net Profit
              </div>
              <div style={{ fontSize: '28px', fontWeight: 600 }}>
                ${profit.toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Revenue</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>
                  ${totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}K` : totalRevenue.toLocaleString()}
                </div>
              </div>
              <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Expense</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>
                  ${totalExpense >= 1000 ? `${(totalExpense / 1000).toFixed(1)}K` : totalExpense.toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '13px', color: '#ccc', marginTop: '8px' }}>
              Profit margin of {profitMargin}%
              {Number(profitMargin) >= 20 ? ' indicates strong financial health' : ' — below 20% target'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinanceDashboard
