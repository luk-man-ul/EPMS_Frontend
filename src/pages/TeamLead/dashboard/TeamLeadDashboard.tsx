import { useEffect, useState } from 'react'
import api from '../../../utils/api'
import SummaryCards from './components/SummaryCards'

const TeamLeadDashboard = () => {
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
    </div>
  )
}

export default TeamLeadDashboard