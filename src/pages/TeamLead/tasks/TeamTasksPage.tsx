import { useState, useEffect } from 'react'
import api from '../../../utils/api'
import StatsCards from './components/StatsCards'
import TaskFilters from './components/TaskFilters'
import TasksTable from './components/TasksTable'
import { useAuth } from '../../../context/AuthContext'

const TeamTasksPage = () => {
  const { user } = useAuth()

  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [projectFilter, setProjectFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  ////////////////////////////////////////////////////////////////
  // FETCH TASKS
  ////////////////////////////////////////////////////////////////

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks')

        const mapped = res.data.data.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          project: t.project?.name ?? 'Unknown',
          projectId: t.project?.id,
          status: normalizeStatus(t.status),
          priority: t.priority?.toLowerCase(),
          assignee: t.assignee
            ? `${t.assignee.firstName} ${t.assignee.lastName}`
            : 'Unassigned',
          dueDate: t.dueDate,
          progress: calculateProgress(t.status),
        }))

        setTasks(mapped)
      } catch (err) {
        console.error('Failed to fetch tasks', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  ////////////////////////////////////////////////////////////////
  // HELPERS
  ////////////////////////////////////////////////////////////////

  const normalizeStatus = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'todo'
      case 'IN_PROGRESS':
        return 'in-progress'
      case 'REVIEW':
        return 'review'
      case 'COMPLETED':
        return 'completed'
      default:
        return status?.toLowerCase()
    }
  }

  const calculateProgress = (status: string) => {
    switch (status) {
      case 'TODO':
        return 10
      case 'IN_PROGRESS':
        return 50
      case 'REVIEW':
        return 80
      case 'COMPLETED':
        return 100
      default:
        return 0
    }
  }

  ////////////////////////////////////////////////////////////////
  // FILTERING
  ////////////////////////////////////////////////////////////////

  const filteredTasks = tasks.filter((task) => {
    const matchesProject =
      projectFilter === 'all' || task.project === projectFilter

    const matchesStatus =
      statusFilter === 'all' || task.status === statusFilter

    const matchesPriority =
      priorityFilter === 'all' || task.priority === priorityFilter

    return matchesProject && matchesStatus && matchesPriority
  })

  ////////////////////////////////////////////////////////////////
  // FILTER OPTIONS
  ////////////////////////////////////////////////////////////////

  const projects = [
    'all',
    ...Array.from(new Set(tasks.map((t) => t.project))),
  ]

  ////////////////////////////////////////////////////////////////
  // STATS
  ////////////////////////////////////////////////////////////////

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  }

  ////////////////////////////////////////////////////////////////

  if (loading) return <div>Loading tasks...</div>

  ////////////////////////////////////////////////////////////////

  const handleCreateTask = () => {
    console.log('Open create modal')
  }

  ////////////////////////////////////////////////////////////////

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700 }}>
          Team Task Management
        </h1>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Manage and track all team tasks across projects
        </p>
      </div>

      <StatsCards stats={stats} />

      <TaskFilters
        projectFilter={projectFilter}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        projects={projects}
        onProjectChange={setProjectFilter}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onCreateTask={handleCreateTask}
isTeamLead={user?.role === 'TEAM_LEAD'}
      />

      <TasksTable
        tasks={filteredTasks}
        role={user?.role}
      />
    </div>
  )
}

export default TeamTasksPage