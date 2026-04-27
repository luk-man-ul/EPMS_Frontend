import { useState, useEffect } from 'react'
import { getProjectProfit } from '../finance.api'
import type { ProjectProfitData } from '../finance.api'
import { getProjectOptions } from '../lookup.api'
import type { ProjectOption } from '../lookup.api'
import { formatCurrency } from '../finance.utils'

const ProjectProfit = () => {
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [data, setData] = useState<ProjectProfitData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load project list once
  useEffect(() => {
    getProjectOptions()
      .then(setProjects)
      .catch(() => {})
  }, [])

  // Fetch profit whenever selected project changes
  useEffect(() => {
    if (!selectedProjectId) { setData(null); return }

    setLoading(true)
    setError(null)
    getProjectProfit(selectedProjectId)
      .then(setData)
      .catch((err: any) => setError(err.response?.data?.message || 'Failed to load project profit'))
      .finally(() => setLoading(false))
  }, [selectedProjectId])

  const selectedName = projects.find((p) => p.id === selectedProjectId)?.name ?? ''

  const profitMargin = data && data.revenue > 0
    ? ((data.profit / data.revenue) * 100).toFixed(1)
    : null

  const cards = data
    ? [
        { label: 'Revenue', value: formatCurrency(data.revenue), color: '#1a1a1a', bgColor: '#fff' },
        { label: 'Expense', value: formatCurrency(data.expense), color: '#666', bgColor: '#fff' },
        {
          label: 'Profit',
          value: formatCurrency(data.profit),
          color: data.profit >= 0 ? '#fff' : '#fff',
          bgColor: data.profit >= 0 ? '#1a1a1a' : '#dc2626',
        },
        ...(profitMargin !== null
          ? [{ label: 'Margin', value: `${profitMargin}%`, color: '#1a1a1a', bgColor: '#fff' }]
          : []),
      ]
    : []

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e5e5',
      borderRadius: '12px',
      padding: '24px',
    }}>
      {/* Header + selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>Project Profit</div>
          {selectedName && (
            <div style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>{selectedName}</div>
          )}
        </div>

        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #e5e5e5',
            fontSize: '14px',
            color: '#1a1a1a',
            background: '#fff',
            cursor: 'pointer',
            outline: 'none',
            minWidth: '220px',
          }}
        >
          <option value="">Select a project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* States */}
      {!selectedProjectId && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#bbb', fontSize: '14px' }}>
          Select a project to view its financial breakdown.
        </div>
      )}

      {selectedProjectId && loading && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#999', fontSize: '14px' }}>
          Loading...
        </div>
      )}

      {selectedProjectId && !loading && error && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Cards */}
      {!loading && !error && data && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cards.length}, 1fr)`,
          gap: '16px',
        }}>
          {cards.map((card) => (
            <div
              key={card.label}
              style={{
                background: card.bgColor,
                border: card.bgColor === '#fff' ? '1px solid #e5e5e5' : 'none',
                borderRadius: '12px',
                padding: '20px 24px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (card.bgColor === '#fff') {
                  e.currentTarget.style.borderColor = '#d4d4d4'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                }
              }}
              onMouseLeave={(e) => {
                if (card.bgColor === '#fff') {
                  e.currentTarget.style.borderColor = '#e5e5e5'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              <div style={{ fontSize: '12px', color: card.bgColor === '#fff' ? '#999' : 'rgba(255,255,255,0.7)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {card.label}
              </div>
              <div style={{ fontSize: '26px', fontWeight: 600, color: card.color, letterSpacing: '-0.02em' }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProjectProfit
