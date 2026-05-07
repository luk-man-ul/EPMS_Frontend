import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../utils/api'
import TaskTable from '../../shared/tasks/components/TaskTable'
import TaskFilters from '../../shared/tasks/components/TaskFilters'
import SearchBar from '../../../components/shared/SearchBar'
import { useAuth } from '../../../context/AuthContext'
import EditTaskModal from './components/EditTaskModal'
import { Card } from '../../../components/ui'

const TeamTasksPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  // ✅ Universal filter object
  const [filters, setFilters] = useState<any>({})
  
  // ✅ Search state
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // ✅ Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  ////////////////////////////////////////////////////////////////
  // FETCH TASKS
  ////////////////////////////////////////////////////////////////

  const fetchTasks = async () => {
    try {
      setLoading(true)

      const params: any = { page, limit: 10 }
      if (filters.projectId) params.projectId = filters.projectId
      if (filters.type) params.type = filters.type
      if (filters.status) params.status = filters.status
      if (filters.priority) params.priority = filters.priority
      if (filters.dueDate) params.dueDate = filters.dueDate
      if (debouncedSearch) params.search = debouncedSearch

      const res = await api.get('/tasks', { params })
      setTasks(res.data.data || [])
      const p = res.data.pagination
      if (p) setPagination(p)
    } catch (err) {
      console.error('Failed to fetch tasks', err)
    } finally {
      setLoading(false)
    }
  }

  // When page changes (Next/Prev), fetch at the new page.
  // When filters/search change, reset page to 1 first — the page change then triggers the fetch.
  useEffect(() => {
    fetchTasks()
  }, [page])

  useEffect(() => {
    if (page !== 1) {
      setPage(1) // triggers the page useEffect above to fetch
    } else {
      fetchTasks() // already on page 1, fetch directly
    }
  }, [filters, debouncedSearch])

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
  // NAVIGATION
  ////////////////////////////////////////////////////////////////

  const handleCreateTask = () => {
    navigate('/app/tasks/create')
  }

  ////////////////////////////////////////////////////////////////

  return (
    <div>
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
        projects={[]}
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
      <Card padding="lg">
        <TaskTable
          tasks={tasks}
          loading={loading}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e5e5',
              background: page === 1 ? '#f9fafb' : '#fff',
              color: page === 1 ? '#9ca3af' : '#374151',
              fontSize: '14px', fontWeight: 500,
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>
          <span style={{ padding: '8px 16px', fontSize: '14px', color: '#374151' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.totalPages}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e5e5',
              background: page === pagination.totalPages ? '#f9fafb' : '#fff',
              color: page === pagination.totalPages ? '#9ca3af' : '#374151',
              fontSize: '14px', fontWeight: 500,
              cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}

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