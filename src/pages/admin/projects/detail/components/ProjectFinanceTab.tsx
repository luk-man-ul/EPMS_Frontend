import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../../../../utils/api'

interface ProjectProfitData {
  projectId: string
  revenue: number
  expense: number
  profit: number
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const ProjectFinanceTab = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [data, setData] = useState<ProjectProfitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) return
    setLoading(true)
    api.get(`/finance/project/${projectId}`)
      .then((res) => setData(res.data))
      .catch((err: any) => setError(err.response?.data?.message || 'Failed to load finance data'))
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', color: '#999', fontSize: '14px' }}>
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>
        {error}
      </div>
    )
  }

  if (!data) return null

  const profitMargin = data.revenue > 0
    ? ((data.profit / data.revenue) * 100).toFixed(1)
    : '0.0'

  const cards = [
    { label: 'Total Revenue', value: fmt(data.revenue), color: '#1d4ed8', bg: '#eff6ff', icon: '💰' },
    { label: 'Total Expenses', value: fmt(data.expense), color: '#dc2626', bg: '#fef2f2', icon: '📤' },
    { label: 'Net Profit', value: fmt(data.profit), color: data.profit >= 0 ? '#16a34a' : '#dc2626', bg: data.profit >= 0 ? '#f0fdf4' : '#fef2f2', icon: '📈' },
    { label: 'Profit Margin', value: `${profitMargin}%`, color: '#7c3aed', bg: '#f5f3ff', icon: '%' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {cards.map((card) => (
          <div
            key={card.label}
            style={{
              background: card.bg,
              borderRadius: '14px',
              padding: '20px 24px',
              flex: 1,
              minWidth: '180px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: card.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {card.label}
              </span>
              <span style={{ fontSize: '20px' }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Info notice */}
      <div style={{
        padding: '16px 20px',
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}>
        <span style={{ fontSize: '20px' }}>ℹ️</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e40af', marginBottom: '4px' }}>
            Full Finance Management
          </div>
          <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>
            Detailed revenue and expense records are available in the{' '}
            <a href="/admin/finance" style={{ color: '#1e40af', fontWeight: 600 }}>Finance module</a>.
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectFinanceTab
