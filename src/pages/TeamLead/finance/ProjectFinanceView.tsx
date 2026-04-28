import { useState, useEffect } from 'react'
import ProjectSelector from './components/ProjectSelector'
import FinanceCards from './components/FinanceCards'
import api from '../../../utils/api'

interface ProjectOption {
  id: string
  name: string
}

interface ProjectProfitData {
  projectId: string
  revenue: number
  expense: number
  profit: number
}

const ProjectFinanceView = () => {
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [data, setData] = useState<ProjectProfitData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load project list once
  useEffect(() => {
    api.get('/projects', { params: { page: 1, limit: 100 } })
      .then((res) => {
        const list = res.data.data || res.data || []
        const mapped = list.map((p: any) => ({ id: p.id, name: p.name }))
        setProjects(mapped)
        if (mapped.length > 0) setSelectedProjectId(mapped[0].id)
      })
      .catch(() => {})
  }, [])

  // Fetch profit when project changes
  useEffect(() => {
    if (!selectedProjectId) return
    setLoading(true)
    setError(null)
    api.get(`/finance/project/${selectedProjectId}`)
      .then((res) => setData(res.data))
      .catch((err: any) => setError(err.response?.data?.message || 'Failed to load project finance'))
      .finally(() => setLoading(false))
  }, [selectedProjectId])

  const profitMargin = data && data.revenue > 0
    ? parseFloat(((data.profit / data.revenue) * 100).toFixed(1))
    : 0

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            Project Finance View
          </h1>
          <span style={{
            padding: '4px 12px',
            background: '#e0e7ff',
            color: '#4338ca',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Read Only
          </span>
        </div>
        <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>
          Financial overview for your projects
        </p>
      </div>

      {/* Project Selector */}
      <ProjectSelector
        projects={projects}
        selectedProject={selectedProjectId}
        onProjectChange={setSelectedProjectId}
      />

      {/* States */}
      {loading && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#999', fontSize: '14px' }}>
          Loading...
        </div>
      )}

      {!loading && error && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Finance Cards */}
      {!loading && !error && data && (
        <FinanceCards
          totalIncome={data.revenue}
          totalExpense={data.expense}
          profitMargin={profitMargin}
          profitAmount={data.profit}
        />
      )}

      {/* Info Notice */}
      <div style={{
        marginTop: '24px',
        padding: '16px 20px',
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}>
        <div style={{ fontSize: '20px' }}>ℹ️</div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e40af', marginBottom: '4px' }}>
            Read-Only Access
          </div>
          <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>
            This is a read-only view for financial awareness. You cannot modify financial data.
            Contact your administrator for any changes or detailed financial reports.
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectFinanceView
