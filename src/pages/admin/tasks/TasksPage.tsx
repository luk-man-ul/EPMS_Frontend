import { useEffect, useState } from 'react'
import api from '../../../utils/api'
import TaskFilters from '../../shared/tasks/components/TaskFilters'
import TaskTable from '../../shared/tasks/components/TaskTable'
import CreateTaskModal from './components/CreateTaskModal'
import type { Task } from '../../shared/tasks/types/task.types'
import { getProjectsForDropdown } from '../tickets/projects.api'
import { getEmployeesForDropdown } from '../tickets/employees.api'

interface ProjectOption {
  id: string
  name: string
}

interface EmployeeOption {
  id: string
  name: string
}

const TasksPage = () => {
  const [filters, setFilters] = useState<any>({})
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<any>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])

  ////////////////////////////////////////////////////////////
  // FETCH TASKS
  ////////////////////////////////////////////////////////////

  const fetchTasks = async (currentFilters = filters) => {
    try {
      setLoading(true)

      const res = await api.get('/tasks', {
        params: {
          ...currentFilters,
          page: currentFilters.page || 1,
          limit: 10,
        },
      })

      setTasks(res.data.data)
      setPagination(res.data.pagination)
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  ////////////////////////////////////////////////////////////
  // LOAD DROPDOWN DATA
  ////////////////////////////////////////////////////////////

  const loadDropdownData = async () => {
    try {
      const [projectsData, employeesData] = await Promise.all([
        getProjectsForDropdown(),
        getEmployeesForDropdown(),
      ])

      setProjects(projectsData)
      setEmployees(employeesData)
    } catch (err) {
      console.error('Failed to load dropdown data:', err)
    }
  }

  ////////////////////////////////////////////////////////////
  // FILTER HANDLER
  ////////////////////////////////////////////////////////////

  const handleFilterChange = (newFilters: any) => {
    if (newFilters.__clear) {
      setFilters({})
      fetchTasks({})
      return
    }

    const updated = { ...filters, ...newFilters, page: 1 }
    setFilters(updated)
    fetchTasks(updated)
  }

  ////////////////////////////////////////////////////////////
  // STATUS UPDATE
  ////////////////////////////////////////////////////////////

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status })
      fetchTasks()
    } catch (err) {
      console.error('Status update failed:', err)
    }
  }

  ////////////////////////////////////////////////////////////
  // EDIT TASK
  ////////////////////////////////////////////////////////////

  const handleEdit = async (taskId: string) => {
    try {
      const res = await api.get(`/tasks/${taskId}`)
      setEditingTask(res.data)
      setIsModalOpen(true)
    } catch (err) {
      console.error('Failed to load task for edit', err)
    }
  }

  ////////////////////////////////////////////////////////////
  // DELETE TASK
  ////////////////////////////////////////////////////////////

  const handleDelete = async (taskId: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this task?'
    )

    if (!confirmDelete) return

    try {
      await api.delete(`/tasks/${taskId}`)
      fetchTasks()
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  ////////////////////////////////////////////////////////////
  // INITIAL LOAD
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    fetchTasks()
    loadDropdownData()
  }, [])

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600 }}>
            Tasks
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Manage and track all tasks across projects
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null)
            setIsModalOpen(true)
          }}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          + Create Task
        </button>
      </div>

      <TaskFilters
  projects={projects}
  employees={employees}
  filters={filters}
  onFilterChange={handleFilterChange}
  showCreateButton
  onCreateTask={() => {
    setEditingTask(null)
    setIsModalOpen(true)
  }}
/>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e5e5',
          overflow: 'visible',
        }}
      >
        <TaskTable
          tasks={tasks}
          loading={loading}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        task={editingTask}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        onCreated={fetchTasks}
      />
    </div>
  )
}

export default TasksPage