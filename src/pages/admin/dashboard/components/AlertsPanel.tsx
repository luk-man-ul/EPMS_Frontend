import { useEffect, useState } from 'react'
import api from '../../../../utils/api'

interface AlertsData {
  pendingSelfWorkApprovals: number
  overdueTasks: number
  expenseApprovalsPending: number
}

const AlertsPanel = () => {
  const [data, setData] = useState<AlertsData>({ pendingSelfWorkApprovals: 0, overdueTasks: 0, expenseApprovalsPending: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlertsData()
  }, [])

  const fetchAlertsData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/dashboard')
      setData({
        pendingSelfWorkApprovals: response.data.pendingSelfWorkApprovals || 0,
        overdueTasks: response.data.overdueTasks || 0,
        expenseApprovalsPending: response.data.expenseApprovalsPending || 0,
      })
    } catch (error) {
      console.error('Failed to fetch alerts data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h3 className="card-title">Alerts</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Loading...</div>
      </div>
    )
  }

  const alerts = []
  if (data.pendingSelfWorkApprovals > 0) {
    alerts.push(`${data.pendingSelfWorkApprovals} pending self-work approvals`)
  }
  if (data.overdueTasks > 0) {
    alerts.push(`${data.overdueTasks} overdue tasks need attention`)
  }
  if (data.expenseApprovalsPending > 0) {
    alerts.push(`${data.expenseApprovalsPending} expense approvals pending`)
  }

  if (alerts.length === 0) {
    return (
      <div className="card">
        <h3 className="card-title">Alerts</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No alerts at this time</div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="card-title">Alerts</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {alerts.map((alert, index) => (
          <div 
            key={index}
            style={{ 
              padding: '14px 16px', 
              background: '#fafafa', 
              borderRadius: '8px',
              fontSize: '14px',
              color: '#1a1a1a',
              borderLeft: '3px solid #1a1a1a'
            }}
          >
            {alert}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AlertsPanel
