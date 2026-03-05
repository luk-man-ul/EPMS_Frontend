import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../../utils/api'
import TaskTable from '../../shared/tasks/components/TaskTable'
import TaskFilters from '../../shared/tasks/components/TaskFilters'
import SearchBar from '../../../components/shared/SearchBar'
import { useAuth } from '../../../context/AuthContext'
import EditTaskModal from './components/EditTaskModal'

const TeamTasksPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ Universal filter object
  const [filters, setFilters] = useState<any>({})
  
  // ✅ Search state
  const [searchTerm, setSearchTerm] = useState('')

  // ✅ Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)

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

  // Refetch tasks when returning to this page
  useEffect(() => {
    // Check if we're returning from a detail page or if state indicates refresh
    const shouldRefresh = location.state?.refresh || location.key !== 'default'
    
    if (shouldRefresh && !loading) {
      fetchTasks()
      
      // Clear the refresh state to prevent repeated fetches
      if (location.state?.refresh) {
        window.history.replaceState({}, document.title)
      }
    }
  }, [location])

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
  // DELETE TASK
  ////////////////////////////////////////////////////////////////

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      await api.delete(`/tasks/${taskId}`)
      fetchTasks()
    } catch (err: any) {
      console.error('Delete failed', err)
      alert(err.response?.data?.message || 'Failed to delete task')
    }
  }

  ////////////////////////////////////////////////////////////////
  // EDIT TASK
  ////////////////////////////////////////////////////////////////

  const handleEdit = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setSelectedTask(task)
      setEditModalOpen(true)
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

      const matchesType =
        !filters.type ||
        task.type === filters.type

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
        matchesType &&
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
        showCreateButton={user?.role === 'TEAM_LEAD' || user?.role === 'EMPLOYEE'}
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
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Edit Modal */}
      <EditTaskModal
        isOpen={editModalOpen}
        task={selectedTask}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedTask(null)
        }}
        onSuccess={() => {
          fetchTasks()
        }}
      />
    </div>
  )
}

export default TeamTasksPage