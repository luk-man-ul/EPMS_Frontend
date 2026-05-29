import { useEffect, useState } from 'react'
import StatsCards from './components/StatsCards'
import WorkProgress from './components/WorkProgress'
import AttendanceWidget from './components/AttendanceWidget'
import FinanceWidget from './components/FinanceWidget'
import AlertsPanel from './components/AlertsPanel'
import { TaskStatusChart, AttendanceTrendChart, ProjectProgressChart, TicketStatusChart } from '../../../components/charts'
import { ActivityFeed } from '../../../components/activity'
import { LoadingSpinner, ErrorMessage, Card } from '../../../components/ui'
import api from '../../../utils/api'
import { todayLocalDateStr, daysAgoLocalDateStr } from '../../../utils/date.util'

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartsLoading, setChartsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  
  // Chart data states
  const [taskStatusData, setTaskStatusData] = useState({ completed: 0, inProgress: 0, pending: 0, overdue: 0 })
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [projectData, setProjectData] = useState<any[]>([])
  const [ticketStatusData, setTicketStatusData] = useState({ open: 0, inProgress: 0, resolved: 0, closed: 0 })

  useEffect(() => {
    fetchDashboardData()
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setChartsLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [tasksRes, projectsRes, attendanceRes, ticketsRes] = await Promise.all([
        api.get('/tasks').catch(() => ({ data: { data: [] } })),
        api.get('/projects').catch(() => ({ data: { data: [] } })),
        api.get('/attendance', {
          params: {
            startDate: daysAgoLocalDateStr(6),
            endDate: todayLocalDateStr(),
          }
        }).catch(() => ({ data: { data: [] } })),
        api.get('/tickets').catch(() => ({ data: { data: [] } })),
      ])

      // Process task status data
      const tasks = tasksRes.data.data || []
      const taskStats = {
        completed: tasks.filter((t: any) => t.status === 'COMPLETED').length,
        inProgress: tasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
        pending: tasks.filter((t: any) => t.status === 'PENDING' || t.status === 'TODO').length,
        overdue: tasks.filter((t: any) => {
          if (t.status === 'COMPLETED') return false
          if (!t.dueDate) return false
          return new Date(t.dueDate) < new Date()
        }).length,
      }
      setTaskStatusData(taskStats)

      // Process project data
      const projects = projectsRes.data.data || []
      const projectChartData = projects.slice(0, 6).map((project: any) => ({
        name: project.name.length > 12 ? project.name.substring(0, 12) + '...' : project.name,
        progress: project.progress || 0,
      }))
      setProjectData(projectChartData)

      // Process attendance data — read from Attendance table (includes ABSENT rows)
      // Each record has: { date: 'YYYY-MM-DD', status: 'PRESENT'|'LATE'|'WFH'|'HALF_DAY'|'ABSENT' }
      const attendanceRecords = attendanceRes.data.data || []
      const attendanceByDate: any = {}

      // Initialize last 7 days using local date strings
      for (let i = 0; i < 7; i++) {
        const dateStr = daysAgoLocalDateStr(6 - i)
        attendanceByDate[dateStr] = { present: 0, absent: 0 }
      }

      // Count by status — present bucket includes PRESENT, LATE, WFH, HALF_DAY
      attendanceRecords.forEach((record: any) => {
        const dateStr: string = record.date
        if (!dateStr || !attendanceByDate[dateStr]) return
        if (record.status === 'ABSENT') {
          attendanceByDate[dateStr].absent++
        } else {
          attendanceByDate[dateStr].present++
        }
      })

      const attendanceChartData = Object.keys(attendanceByDate).map(date => ({
        date: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        present: attendanceByDate[date].present,
        absent: attendanceByDate[date].absent,
      }))
      setAttendanceData(attendanceChartData)

      // Process ticket data
      const tickets = ticketsRes.data.data || []
      const ticketStats = {
        open: tickets.filter((t: any) => t.status === 'OPEN').length,
        inProgress: tickets.filter((t: any) => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter((t: any) => t.status === 'RESOLVED').length,
        closed: tickets.filter((t: any) => t.status === 'CLOSED').length,
      }
      setTicketStatusData(ticketStats)

    } catch (err: any) {
      console.error('Dashboard fetch error:', err)
      setError(err.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
      setChartsLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <LoadingSpinner text="Loading dashboard..." />
      </Card>
    )
  }

  if (error) {
    return <ErrorMessage type="page" message={error} />
  }

  return (
    <div className="dashboard" style={isMobile ? { gap: '16px' } : undefined}>
      <StatsCards />

      {/* Work Progress · Attendance Summary · Finance Snapshot
          Placed directly below KPI cards for immediate visibility */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: isMobile ? '16px' : '24px',
        margin: isMobile ? '16px 0' : '24px 0',
      }}>
        <WorkProgress />
        <AttendanceWidget />
        <FinanceWidget />
      </div>

      {/* Analytics Charts Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: isMobile ? '16px' : '24px',
        margin: isMobile ? '16px 0' : '24px 0'
      }}>
        <TaskStatusChart data={taskStatusData} loading={chartsLoading} />
        <TicketStatusChart data={ticketStatusData} loading={chartsLoading} />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: isMobile ? '16px' : '24px',
        marginBottom: isMobile ? '16px' : '24px'
      }}>
        <ProjectProgressChart data={projectData} loading={chartsLoading} />
        <AttendanceTrendChart data={attendanceData} loading={chartsLoading} days={7} />
      </div>

      {/* Activity Feed */}
      <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
        <ActivityFeed limit={20} title="Recent System Activity" />
      </div>

      <div className="dashboard-grid" style={isMobile ? { gridTemplateColumns: '1fr', gap: '16px' } : undefined}>
        <AlertsPanel />
      </div>
    </div>
  )
}

export default AdminDashboard
