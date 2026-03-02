import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../utils/api'
import TaskTable from '../../shared/tasks/components/TaskTable'
import TaskFilters from '../../shared/tasks/components/TaskFilters'
import SearchBar from '../../../components/shared/SearchBar'
import { useAuth } from '../../../context/AuthContext'

const TeamTasksPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ Universal filter object
  const [filters, setFilters] = useState<any>({})
  
  // ✅ Search state
  const [searchTerm, setSearchTerm] = useState('')

  ////////////////////////////////////////////////////////////////
  // FETCH TASKS
  ////////////////////////////////////////////////////////////////

  const fetchTasks = async () => {
    try {
      setLoading(true)

      const res = await api.get('/tasks')
      setTasks(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch tasks', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  ////////////////////////////////////////////////////////////////
  // STATUS UPDATE
  ////////////////////////////////////////////////////////////////

  const handleStatusChange = async (
    taskId: string,
    status: string
  ) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status })
      fetchTasks()
    } catch (err) {
      console.error('Status update failed', err)
    }
  }

  ////////////////////////////////////////////////////////////////
  // FILTERING (BASED ON UNIVERSAL FILTER STRUCTURE + SEARCH)
  ////////////////////////////////////////////////////////////////

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesProject =
        !filters.projectId ||
        task.project?.id === filters.projectId

      const matchesStatus =
        !filters.status ||
        task.status === filters.status

      const matchesPriority =
        !filters.priority ||
        task.priority === filters.priority

      const matchesDueDate =
        !filters.dueDate ||
        (task.dueDate &&
          task.dueDate.startsWith(filters.dueDate))

      return (
        matchesSearch &&
        matchesProject &&
        matchesStatus &&
        matchesPriority &&
        matchesDueDate
      )
    })
  }, [tasks, filters, searchTerm])

  ////////////////////////////////////////////////////////////////
  // PROJECT OPTIONS (FORMAT FOR UNIVERSAL FILTER)
  ////////////////////////////////////////////////////////////////

  const projects = useMemo(() => {
    const map = new Map()

    tasks.forEach((task) => {
      if (task.project?.id) {
        map.set(task.project.id, {
          id: task.project.id,
          name: task.project.name,
        })
      }
    })

    return Array.from(map.values())
  }, [tasks])

  ////////////////////////////////////////////////////////////////
  // NAVIGATION
  ////////////////////////////////////////////////////////////////

  const handleCreateTask = () => {
    navigate('/app/tasks/create')
  }

  ////////////////////////////////////////////////////////////////

  return (
    <div
      style={{
        padding: '32px',
        background: '#f8fafc',
        minHeight: '100vh',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          marginBottom: '24px',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '6px',
          }}
        >
          Task Management
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#64748b',
          }}
        >
          Manage, assign and track team tasks
        </p>
      </div>

      {/* SEARCH BAR */}
      <div style={{ marginBottom: '16px' }}>
        <SearchBar
          placeholder="Search tasks by title or description..."
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => setSearchTerm('')}
        />
      </div>

      {/* UNIVERSAL FILTER */}
      <TaskFilters
        projects={projects}
        filters={filters}
        onFilterChange={(newFilters) => {
          if (newFilters.__clear) {
            setFilters({})
          } else {
            setFilters((prev: any) => ({
              ...prev,
              ...newFilters,
            }))
          }
        }}
        showCreateButton={user?.role === 'TEAM_LEAD'}
        onCreateTask={handleCreateTask}
      />

      {/* TABLE */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
          border: '1px solid #f1f5f9',
        }}
      >
        <TaskTable
          tasks={filteredTasks}
          loading={loading}
          onStatusChange={handleStatusChange}
          onEdit={(id) => navigate(`/app/tasks/${id}`)}
          onDelete={() => {}}
        />
      </div>
    </div>
  )
}

export default TeamTasksPage