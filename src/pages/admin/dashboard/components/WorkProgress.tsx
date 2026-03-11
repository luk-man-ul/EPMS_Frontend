import { useEffect, useState } from 'react'
import api from '../../../../utils/api'

interface WorkProgressData {
  taskCompletion: number
  ticketResolution: number
  overdueTasks: number
}

const WorkProgress = () => {
  const [data, setData] = useState<WorkProgressData>({ taskCompletion: 0, ticketResolution: 0, overdueTasks: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkProgress()
  }, [])

  const fetchWorkProgress = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/dashboard')
      setData({
        taskCompletion: response.data.taskCompletion || 0,
        ticketResolution: response.data.ticketResolution || 0,
        overdueTasks: response.data.overdueTasks || 0,
      })
    } catch (error) {
      console.error('Failed to fetch work progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h3 className="card-title">Work Progress</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="card-title">Work Progress</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Task Completion</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{data.taskCompletion}%</span>
          </div>
          <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${data.taskCompletion}%`, background: '#1a1a1a', borderRadius: '3px' }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Ticket Resolution</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{data.ticketResolution}%</span>
          </div>
          <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${data.ticketResolution}%`, background: '#1a1a1a', borderRadius: '3px' }} />
          </div>
        </div>

        <div style={{ 
          marginTop: '8px', 
          padding: '12px', 
          background: '#fafafa', 
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Overdue Tasks</span>
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>{data.overdueTasks}</span>
        </div>
      </div>
    </div>
  )
}

export default WorkProgress
