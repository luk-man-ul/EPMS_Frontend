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

const TicketsPage = () => {
  interface TicketFiltersState {
  status?: string
  priority?: string
  projectId?: string
  assignedToId?: string
}

  const [filters, setFilters] = useState<TicketFiltersState>({})
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

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

      // assuming backend returns { data, meta }
      setTickets(response.data)

    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets(filters)
  }, [filters])

  ////////////////////////////////////////////////////////////
  // FILTER HANDLER
  ////////////////////////////////////////////////////////////

const handleFilterChange = (newFilters: any) => {
  // CLEAR LOGIC
  if (newFilters.__clear) {
    setFilters({})
    fetchTickets({})
    return
  }

  const updated = { ...filters, ...newFilters, page: 1 }
  setFilters(updated)
  fetchTickets(updated)
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
          overflow: 'hidden',
        }}
      >
        <TicketTable tickets={tickets} loading={loading} />
      </div>

      {/* Modal */}
      {showModal && (
        <TicketCreateModal
          onClose={() => setShowModal(false)}
          onSuccess={() => fetchTickets(filters)}
        />
      )}
    </div>
  )
}

export default TicketsPage