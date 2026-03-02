import { useState, useEffect } from 'react'
import api from '../../../utils/api'
import ProjectCard from './components/ProjectCard'
import SearchBar from '../../../components/shared/SearchBar'
import FilterComponent from '../../../components/shared/FilterComponent'
import { ProjectStatus, getEnumOptions } from '../../../types/enums'

const ProjectsPage = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'at-risk'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  /**
   * Maps backend ProjectStatus enum to frontend display status
   * 
   * ISSUE DOCUMENTED (Requirement 26.1):
   * The current implementation has a status determination conflict where:
   * - Backend stores actual lifecycle status (PLANNING, ACTIVE, ON_HOLD, COMPLETED, ARCHIVED)
   * - Frontend computes risk-based status (at-risk) based on project health metrics
   * - The mapStatus function was incorrectly mapping ON_HOLD → 'at-risk'
   * 
   * FIXED LOGIC (Requirement 26.2, 26.3, 26.4):
   * Status precedence algorithm:
   * 1. Terminal states (COMPLETED, ARCHIVED) take highest precedence
   * 2. Explicit lifecycle states (ON_HOLD, PLANNING) take next precedence
   * 3. Risk-based status (at-risk) is computed separately and should not override explicit states
   * 4. Default to 'active' for ACTIVE status
   * 
   * The 'at-risk' status should be computed based on:
   * - Days remaining < 7 AND progress < 75%
   * - Open tasks count high relative to deadline
   * - Budget overrun (if applicable)
   * 
   * This ensures ON_HOLD status is preserved and not incorrectly overridden by risk calculations.
   */
  const mapStatus = (backendStatus: string) => {
    // Terminal states - highest precedence
    if (backendStatus === 'COMPLETED') return 'completed'
    if (backendStatus === 'ARCHIVED') return 'completed'
    
    // Explicit lifecycle states - second precedence
    if (backendStatus === 'ON_HOLD') return 'on-hold'
    if (backendStatus === 'PLANNING') return 'active'
    
    // Default active state
    if (backendStatus === 'ACTIVE') return 'active'
    
    return 'active'
  }

  /**
   * Computes risk-based status for a project
   * This is separate from lifecycle status and should not override it
   * 
   * @param project - Project with endDate, progress, and status
   * @returns 'at-risk' if project is in danger, otherwise null
   */
  const computeRiskStatus = (project: any): 'at-risk' | null => {
    // Don't compute risk for terminal or on-hold states
    if (project.status === 'COMPLETED' || 
        project.status === 'ARCHIVED' || 
        project.status === 'ON_HOLD') {
      return null
    }

    // Check if approaching deadline with low progress
    if (project.endDate) {
      const daysRemaining = Math.ceil(
        (new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysRemaining < 7 && project.progress < 75) {
        return 'at-risk'
      }
    }

    return null
  }

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get('/projects')
      const mapped = res.data.data.map((p: any) => {
        const lifecycleStatus = mapStatus(p.status)
        const riskStatus = computeRiskStatus(p)
        
        return {
          ...p,
          status: riskStatus || lifecycleStatus, // Risk overrides only if present and lifecycle allows
          backendStatus: p.status, // Preserve original for filtering
        }
      })
      setProjects(mapped)
    } catch (err: any) {
      console.error('Failed to fetch projects', err)
      setError(err.response?.data?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter((p) => {
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // Apply status filter (backend enum)
    if (statusFilter) {
      if (p.backendStatus !== statusFilter) return false
    }

    // Apply tab filter (legacy UI filter based on computed status)
    if (filter !== 'all') {
      if (p.status !== filter) return false
    }

    return true
  })

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    atRisk: projects.filter((p) => p.status === 'at-risk').length,
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        fontSize: '14px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #e5e5e5',
            borderTop: '3px solid #1a1a1a',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px'
          }} />
          Loading projects...
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700 }}>My Projects</h1>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Manage and track all projects assigned to you
          </p>
        </div>
        
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#991b1b', marginBottom: '8px' }}>
            Error Loading Projects
          </div>
          <div style={{ fontSize: '14px', color: '#b91c1c' }}>
            {error}
          </div>
          <button
            onClick={fetchProjects}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              background: '#ffffff',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              color: '#991b1b',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fef2f2'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700 }}>My Projects</h1>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Manage and track all projects assigned to you
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <StatCard label="Total Projects" value={stats.total} />
        <StatCard label="Active Projects" value={stats.active} color="#10b981" />
        <StatCard label="Completed" value={stats.completed} color="#6366f1" />
        <StatCard label="At Risk" value={stats.atRisk} color="#ef4444" />
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #e5e5e5',
      }}>
        {[
          { label: 'All Projects', value: 'all' as const },
          { label: 'Active', value: 'active' as const },
          { label: 'Completed', value: 'completed' as const },
          { label: 'At Risk', value: 'at-risk' as const },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom:
                filter === tab.value
                  ? '2px solid #1a1a1a'
                  : '2px solid transparent',
              fontWeight: filter === tab.value ? 600 : 500,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filter Controls */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        alignItems: 'flex-end',
      }}>
        <SearchBar
          placeholder="Search projects by name or description..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <FilterComponent
          label="Status"
          options={getEnumOptions(ProjectStatus)}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px',
      }}>
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#fafafa',
          borderRadius: '12px',
          border: '1px solid #e5e5e5'
        }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 600, 
            color: '#1a1a1a',
            marginBottom: '8px'
          }}>
            No projects found
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {searchTerm || statusFilter 
              ? 'Try adjusting your search or filter criteria' 
              : 'No projects available'}
          </div>
        </div>
      )}
    </div>
  )
}

const StatCard = ({
  label,
  value,
  color = '#1a1a1a',
}: {
  label: string
  value: number
  color?: string
}) => (
  <div style={{
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e5e5e5',
  }}>
    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
      {label}
    </div>
    <div style={{ fontSize: '32px', fontWeight: 600, color }}>
      {value}
    </div>
  </div>
)

export default ProjectsPage