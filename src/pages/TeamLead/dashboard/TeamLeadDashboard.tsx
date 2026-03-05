import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../utils/api'
import SummaryCards from './components/SummaryCards'
import { PendingApprovalsDashboard, SelfWorkMetricsDashboard } from '../../../components/shared'

const TeamLeadDashboard = () => {
  const { user } = useAuth()
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [taskRes, projectRes] = await Promise.all([
          api.get('/tasks/dashboard/summary'),
          api.get('/projects/my'),
        ])

        setSummary({
          ...taskRes.data,
          activeProjects: projectRes.data.length,
        })
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) return <div>Loading dashboard...</div>

  return (
    <div>
      <SummaryCards summary={summary} />
      
      {/* Only show approval dashboards for TEAM_LEAD and ADMIN */}
      {user && (user.role === 'TEAM_LEAD' || user.role === 'ADMIN') && (
        <>
          <div style={{ marginTop: '24px' }}>
            <PendingApprovalsDashboard />
          </div>
          
          <div style={{ marginTop: '24px' }}>
            <SelfWorkMetricsDashboard />
          </div>
        </>
      )}
    </div>
  )
}

export default TeamLeadDashboard