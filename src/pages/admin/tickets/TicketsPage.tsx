import { useEffect, useState } from 'react'
import TicketFilters from './components/TicketFilters'
import TicketTable from './components/TicketTable'
import { getTickets } from './tickets.api'
import type { Ticket } from './types/ticket.types'
import TicketCreateModal from './components/TicketCreateModal'
import {
  getProjectsForDropdown,
  type ProjectOption,
} from './projects.api'
import {
  getEmployeesForDropdown,
  type EmployeeOption,
} from './employees.api'
import { useAuth } from '../../../context/AuthContext'
import SearchBar from '../../../components/shared/SearchBar'
import api from '../../../utils/api'

const TicketsPage = () => {
  const { user } = useAuth()
  
  interface TicketFiltersState {
  status?: string
  priority?: string
  projectId?: string
  assignedToId?: string
  search?: string
  page?: number
  limit?: number
}

  const [filters, setFilters] = useState<TicketFiltersState>({ page: 1, limit: 10 })
  const [searchTerm, setSearchTerm] = useState('')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)

  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])

  ////////////////////////////////////////////////////////////
  // LOAD DROPDOWN DATA
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [projectData, employeeData] =
          await Promise.all([
            getProjectsForDropdown(),
            getEmployeesForDropdown(),
          ])

        setProjects(projectData)
        setEmployees(employeeData)
      } catch (err) {
        console.error('Failed to load dropdown data', err)
      }
    }

    loadDropdownData()
  }, [])

  ////////////////////////////////////////////////////////////
  // FETCH TICKETS
  ////////////////////////////////////////////////////////////

  const fetchTickets = async (queryFilters?: any) => {
    try {
      setLoading(true)

      const response = await getTickets(queryFilters)

      setTickets(response.data)
      // Backend returns either `pagination` or `meta`
      const p = response.pagination || (response.meta ? {
        total: response.meta.total,
        page: response.meta.page,
        limit: response.meta.limit,
        totalPages: Math.ceil(response.meta.total / response.meta.limit),
      } : null)
      if (p) setPagination(p)

    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtersWithSearch = { ...filters }
    if (searchTerm) {
      filtersWithSearch.search = searchTerm
    }
    fetchTickets(filtersWithSearch)
  }, [filters])

  ////////////////////////////////////////////////////////////
  // FILTER HANDLER
  ////////////////////////////////////////////////////////////

const handleFilterChange = (newFilters: any) => {
  // CLEAR LOGIC
  if (newFilters.__clear) {
    setFilters({ page: 1, limit: 10 })
    setSearchTerm('')
    return
  }

  // Pagination clicks: preserve filters, just change page
  const isPaginationClick = Object.keys(newFilters).length === 1 && 'page' in newFilters
  setFilters((prev: any) => isPaginationClick
    ? { ...prev, page: newFilters.page }
    : { ...prev, ...newFilters, page: 1 }
  )
}

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setFilters((prev: any) => ({ ...prev, page: 1 }))
  }

  const handleSearchClear = () => {
    setSearchTerm('')
  }

  ////////////////////////////////////////////////////////////
  // EDIT HANDLER
  ////////////////////////////////////////////////////////////

  const handleEdit = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId)
    if (ticket) {
      setEditingTicket(ticket)
      setShowModal(true)
    }
  }

  ////////////////////////////////////////////////////////////
  // DELETE HANDLER
  ////////////////////////////////////////////////////////////

  const handleDelete = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) {
      return
    }

    try {
      await api.delete(`/tickets/${ticketId}`)
      fetchTickets(filters)
    } catch (err: any) {
      console.error('Delete failed', err)
      alert(err.response?.data?.message || 'Failed to delete ticket')
    }
  }

  ////////////////////////////////////////////////////////////
  // MODAL CLOSE HANDLER
  ////////////////////////////////////////////////////////////

  const handleModalClose = () => {
    setShowModal(false)
    setEditingTicket(null)
  }

  ////////////////////////////////////////////////////////////

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 600,
              marginBottom: 4,
              color: '#1a1a1a',
              letterSpacing: '-0.01em',
            }}
          >
            Tickets
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Manage and resolve support tickets
          </p>
        </div>

        {/* Only show Create Ticket button if user is not ADMIN */}
        {user?.role !== 'ADMIN' && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            + Create Ticket
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <SearchBar
          placeholder="Search tickets by title or description..."
          value={searchTerm}
          onChange={handleSearchChange}
          onClear={handleSearchClear}
        />
      </div>

      {/* Filters */}
     <TicketFilters
  projects={projects}
  employees={employees}
  filters={filters}
  onFilterChange={handleFilterChange}
/>

      {/* Table */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e5e5',
          overflow: 'visible',
        }}
      >
        <TicketTable 
          tickets={tickets} 
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => handleFilterChange({ page: (filters.page || 1) - 1 })}
            disabled={(filters.page || 1) === 1}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e5e5',
              background: (filters.page || 1) === 1 ? '#f9fafb' : '#fff',
              color: (filters.page || 1) === 1 ? '#9ca3af' : '#374151',
              fontSize: '14px', fontWeight: 500,
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
              padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e5e5',
              background: (filters.page || 1) === pagination.totalPages ? '#f9fafb' : '#fff',
              color: (filters.page || 1) === pagination.totalPages ? '#9ca3af' : '#374151',
              fontSize: '14px', fontWeight: 500,
              cursor: (filters.page || 1) === pagination.totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TicketCreateModal
          ticket={editingTicket}
          onClose={handleModalClose}
          onSuccess={() => fetchTickets(filters)}
        />
      )}
    </div>
  )
}
export default TicketsPage