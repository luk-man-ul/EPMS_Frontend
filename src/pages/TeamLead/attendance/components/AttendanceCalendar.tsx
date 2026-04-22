import { useState } from 'react'
import type { AttendanceRecord } from '../types/attendance.types'
import { formatLocalDate } from '../../../../utils/date.util'

type AttendanceCalendarProps = {
  attendanceData: AttendanceRecord[]
  onDateSelect: (date: string) => void
}

const AttendanceCalendar = ({ attendanceData, onDateSelect }: AttendanceCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getMonthData = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getDateStatus = (date: Date) => {
    const dateString = formatLocalDate(date)
    const dayRecords = attendanceData.filter(r => r.date === dateString)
    
    if (dayRecords.length === 0) return null
    
    const statusCounts = {
      present: dayRecords.filter(r => r.status === 'present').length,
      absent: dayRecords.filter(r => r.status === 'absent').length,
      leave: dayRecords.filter(r => r.status === 'leave').length,
      wfh: dayRecords.filter(r => r.status === 'wfh').length,
    }
    
    // Return the dominant status
    const maxStatus = Object.entries(statusCounts).reduce((a, b) => 
      statusCounts[a[0] as keyof typeof statusCounts] > statusCounts[b[0] as keyof typeof statusCounts] ? a : b
    )
    
    return maxStatus[0]
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'present': return '#10b981'
      case 'absent': return '#ef4444'
      case 'leave': return '#f59e0b'
      case 'wfh': return '#3b82f6'
      default: return '#f5f5f5'
    }
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const days = getMonthData()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e5e5',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#1a1a1a',
          margin: 0,
        }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={previousMonth}
            style={{
              padding: '8px 12px',
              background: '#f5f5f5',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e5e5e5'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
          >
            ← Prev
          </button>
          <button
            onClick={nextMonth}
            style={{
              padding: '8px 12px',
              background: '#f5f5f5',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e5e5e5'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        {[
          { label: 'Present', color: '#10b981' },
          { label: 'Absent', color: '#ef4444' },
          { label: 'Leave', color: '#f59e0b' },
          { label: 'WFH', color: '#3b82f6' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              background: item.color,
            }} />
            <span style={{ fontSize: '13px', color: '#666666' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
      }}>
        {/* Day names */}
        {dayNames.map((day) => (
          <div
            key={day}
            style={{
              padding: '12px',
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: 600,
              color: '#666666',
            }}
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} />
          }

          const status = getDateStatus(date)
          const isToday = date.getTime() === today.getTime()
          const isFuture = date > today

          return (
            <button
              key={index}
              onClick={() => !isFuture && onDateSelect(formatLocalDate(date))}
              disabled={isFuture}
              style={{
                padding: '12px',
                background: isFuture ? '#fafafa' : getStatusColor(status),
                border: isToday ? '2px solid #1a1a1a' : '1px solid #e5e5e5',
                borderRadius: '8px',
                cursor: isFuture ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isFuture ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isFuture) {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                fontSize: '14px',
                fontWeight: isToday ? 700 : 500,
                color: status && !isFuture ? '#ffffff' : '#1a1a1a',
              }}>
                {date.getDate()}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AttendanceCalendar
