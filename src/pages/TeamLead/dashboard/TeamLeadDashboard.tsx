import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../utils/api'
import SummaryCards from './components/SummaryCards'
import { PendingApprovalsDashboard, SelfWorkMetricsDashboard } from '../../../components/shared'
import { Card, LoadingSpinner, ErrorMessage } from '../../../components/ui'
import { TaskStatusChart, AttendanceTrendChart, ProjectProgressChart } from '../../../components/charts'
import { ActivityFeed } from '../../../components/activity'
import { formatLocalDate } from '../../../utils/date.util'

const TeamLeadDashboard = () => {
  const { user } = useAuth()
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Chart data states
  const [taskStatusData, setTaskStatusData] = useState({ completed: 0, inProgress: 0, pending: 0, overdue: 0 })
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [projectData, setProjectData] = useState<any[]>([])
  const [chartsLoading, setChartsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [taskRes, projectRes] = await Promise.all([
          api.get('/tasks/dashboard/summary'),
          api.get('/projects/my'),
        ])

        setSummary({
          ...taskRes.data,
          activeProjects: projectRes.data.length,
        })
        
        // Fetch chart data
        await fetchChartData(projectRes.data)
      } catch (err: any) {
        console.error('Dashboard fetch error:', err)
        setError(err.response?.data?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])
  
  const fetchChartData = async (projects: any[]) => {
    try {
      setChartsLoading(true)
      
      // Fetch tasks for task status chart
      const tasksRes = await api.get('/tasks')
      const tasks = tasksRes.data.data || []
      
      // Calculate task status distribution
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
      
      // Fetch attendance data for trend chart
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
      
      try {
        const attendanceRes = await api.get('/attendance', {
          params: {
            startDate: formatLocalDate(startDate),
            endDate: formatLocalDate(endDate),
          }
        })
        
        // Process attendance data for chart
        const attendanceByDate: any = {}
        const attendanceRecords = attendanceRes.data.data || []
        
        // Initialize all dates with 0
        for (let i = 0; i < 7; i++) {
          const date = new Date()
          date.setDate(date.getDate() - (6 - i))
          const dateStr = formatLocalDate(date)
          attendanceByDate[dateStr] = { present: 0, absent: 0 }
        }
        
        // Count present days
        attendanceRecords.forEach((record: any) => {
          const dateStr = record.date?.split('T')[0] || record.createdAt?.split('T')[0]
          if (dateStr && attendanceByDate[dateStr]) {
            attendanceByDate[dateStr].present++
          }
        })
        
        const attendanceChartData = Object.keys(attendanceByDate).map(date => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          present: attendanceByDate[date].present,
          absent: attendanceByDate[date].absent,
        }))
        
        setAttendanceData(attendanceChartData)
      } catch (err) {
        console.error('Failed to fetch attendance data:', err)
        setAttendanceData([])
      }
      
      // Process project data for progress chart
      const projectChartData = projects.slice(0, 5).map((project: any) => ({
        name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
        progress: project.progress || 0,
      }))
      setProjectData(projectChartData)
      
    } catch (err) {
      console.error('Failed to fetch chart data:', err)
    } finally {
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
    return (
      <ErrorMessage type="page" message={error} />
    )
  }

  return (
    <div>
      <SummaryCards summary={summary} />
      
      {/* Analytics Charts */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px',
        marginTop: '24px'
      }}>
        <TaskStatusChart data={taskStatusData} loading={chartsLoading} />
        <ProjectProgressChart data={projectData} loading={chartsLoading} />
      </div>
      
      <div style={{ marginTop: '24px' }}>
        <AttendanceTrendChart data={attendanceData} loading={chartsLoading} days={7} />
      </div>
      
      {/* Activity Feed */}
      <div style={{ marginTop: '24px' }}>
        <ActivityFeed limit={20} title="Recent Team Activity" />
      </div>
      
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