import { useEffect, useState } from 'react'
import api from '../../../../utils/api'

interface StatusBreakdown {
  TODO: number
  IN_PROGRESS: number
  REVIEW: number
  COMPLETED: number
  CANCELLED: number
}

const TaskStatusWidget = () => {
  const [data, setData] = useState<StatusBreakdown | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/tasks/status-breakdown')
        setData(res.data)
      } catch (err) {
        console.error('Status breakdown error:', err)
      }
    }

    fetchData()
  }, [])

  if (!data) return <div>Loading status...</div>

  const statuses = Object.entries(data) as [string, number][]

  return (
    <div
      style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #e5e5e5',
      }}
    >
      <h3 style={{ marginBottom: '16px' }}>Task Status Overview</h3>

      {statuses.map(([status, count]) => (
        <div
          key={status}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0',
            fontSize: '14px',
          }}
        >
          <span>{status.replace('_', ' ')}</span>
          <strong>{count}</strong>
        </div>
      ))}
    </div>
  )
}

export default TaskStatusWidget