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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [filters, setFilters] = useState<any>({})
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<any>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])


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
      const cleared = {}
      setFilters(cleared)
      fetchTasks(cleared)
      return
    }

    // Pagination clicks pass { page: N } — preserve current filters, don't reset to page 1
    const isPaginationClick = Object.keys(newFilters).length === 1 && 'page' in newFilters
    setFilters((prev: any) => {
      const updated = isPaginationClick
        ? { ...prev, page: newFilters.page }
        : { ...prev, ...newFilters, page: 1 }
      fetchTasks(updated)
      return updated
    })
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
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '0px',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: 0 }}>
            Tasks
          </h1>
        </div>

        <button
          onClick={() => {
            setEditingTask(null)
            setIsModalOpen(true)
          }}
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            fontWeight: 500,
            cursor: 'pointer',
            textAlign: 'center',
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
/>

      <div
        style={{
          backgroundColor: isMobile ? 'transparent' : '#fff',
          borderRadius: '12px',
          border: isMobile ? 'none' : '1px solid #e5e5e5',
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => handleFilterChange({ page: (filters.page || 1) - 1 })}
            disabled={(filters.page || 1) === 1}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              background: (filters.page || 1) === 1 ? '#f9fafb' : '#fff',
              color: (filters.page || 1) === 1 ? '#9ca3af' : '#374151',
              fontSize: '14px',
              fontWeight: 500,
              cursor: (filters.page || 1) === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>
          <span style={{ padding: '8px 16px', fontSize: '14px', color: '#374151' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handleFilterChange({ page: (filters.page || 1) + 1 })}
            disabled={(filters.page || 1) === pagination.totalPages}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              background: (filters.page || 1) === pagination.totalPages ? '#f9fafb' : '#fff',
              color: (filters.page || 1) === pagination.totalPages ? '#9ca3af' : '#374151',
              fontSize: '14px',
              fontWeight: 500,
              cursor: (filters.page || 1) === pagination.totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default TasksPage