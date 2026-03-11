import { useEffect, useState } from 'react'
import api from '../../../../utils/api'

interface AttendanceData {
  presentToday: number
  absentToday: number
  lateCheckIns: number
}

const AttendanceWidget = () => {
  const [data, setData] = useState<AttendanceData>({ presentToday: 0, absentToday: 0, lateCheckIns: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttendanceData()
  }, [])

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/dashboard')
      setData({
        presentToday: response.data.presentToday || 0,
        absentToday: response.data.absentToday || 0,
        lateCheckIns: response.data.lateCheckIns || 0,
      })
    } catch (error) {
      console.error('Failed to fetch attendance data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h3 className="card-title">Attendance Summary</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="card-title">Attendance Summary</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ 
          padding: '16px', 
          background: '#fafafa', 
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Present Today</span>
          <span style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a' }}>{data.presentToday}</span>
        </div>

        <div style={{ 
          padding: '16px', 
          background: '#fafafa', 
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Absent Today</span>
          <span style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a' }}>{data.absentToday}</span>
        </div>

        <div style={{ 
          padding: '16px', 
          background: '#fafafa', 
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Late Check-ins</span>
          <span style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a' }}>{data.lateCheckIns}</span>
        </div>
      </div>
    </div>
  )
}

export default AttendanceWidget
