import type { AttendanceRecord } from '../types/attendance.types'
import { formatLocalDate } from '../../../../utils/date.util'

export const teamMembers = [
  { id: 'EMP-001', name: 'Sarah Johnson' },
  { id: 'EMP-002', name: 'Mike Chen' },
  { id: 'EMP-003', name: 'Emily Davis' },
  { id: 'EMP-004', name: 'John Smith' },
  { id: 'EMP-005', name: 'Alex Kumar' },
  { id: 'EMP-006', name: 'Lisa Wang' },
]

// Generate attendance data for the current month
export const generateAttendanceData = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = []
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  // Generate data for the past 15 days
  for (let day = 1; day <= 15; day++) {
    const date = new Date(currentYear, currentMonth, day)
    const dateString = formatLocalDate(date)
    
    teamMembers.forEach((member, index) => {
      // Create varied attendance patterns
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      
      if (isWeekend) return // Skip weekends
      
      let status: AttendanceRecord['status'] = 'present'
      let checkIn = '09:00 AM'
      let checkOut = '06:00 PM'
      let totalHours = '9h 0m'
      
      // Create some variation
      const random = (day + index) % 10
      
      if (random === 0) {
        status = 'absent'
        checkIn = null
        checkOut = null
        totalHours = null
      } else if (random === 1) {
        status = 'leave'
        checkIn = null
        checkOut = null
        totalHours = null
      } else if (random === 2) {
        status = 'wfh'
        checkIn = '09:30 AM'
        checkOut = '06:30 PM'
        totalHours = '9h 0m'
      } else if (random === 3) {
        // Late check-in
        checkIn = '10:15 AM'
        checkOut = '07:00 PM'
        totalHours = '8h 45m'
      } else if (random === 4) {
        // Early check-out
        checkIn = '09:00 AM'
        checkOut = '04:30 PM'
        totalHours = '7h 30m'
      }
      
      records.push({
        id: `ATT-${dateString}-${member.id}`,
        employeeId: member.id,
        employeeName: member.name,
        date: dateString,
        checkIn,
        checkOut,
        totalHours,
        status,
      })
    })
  }
  
  return records
}

export const attendanceData = generateAttendanceData()
