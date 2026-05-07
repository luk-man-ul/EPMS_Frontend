import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../utils/api'
import { useAuth } from '../../../context/AuthContext'
import TicketFilters from './components/TicketFilters'
import TicketsTable from './components/TicketsTable'

const TicketsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  const [projectFilter, setProjectFilter] = useState('all')
  const [assignedToFilter, setAssignedToFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const [projects, setProjects] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])

  // Fetch projects and employees for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const projectsRes = await api.get('/projects')
        const projectsData = projectsRes.data.data || projectsRes.data || []
        
        setProjects(projectsData)
        
        // Extract unique employees from project members
        const employeesMap = new Map()
        projectsData.forEach((project: any) => {
          project.members?.forEach((member: any) => {
            if (member.user && !employeesMap.has(member.user.id)) {
              employeesMap.set(member.user.id, {
                id: member.user.id,
                name: `${member.user.firstName} ${member.user.lastName}`,
              })
            }
          })
        })
        
        const employeesList = Array.from(employeesMap.values())
        setEmployees(employeesList)
      } catch (err) {
        console.error('Failed to load filter data', err)
      }
    }

    fetchFilterData()
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = { page, limit: 10 }

      if (statusFilter !== 'all') params.status = statusFilter.toUpperCase()
      if (priorityFilter !== 'all') params.priority = priorityFilter.toUpperCase()
      if (projectFilter !== 'all') params.projectId = projectFilter
      if (assignedToFilter !== 'all') params.assignedToId = assignedToFilter
      if (typeFilter !== 'all') params.type = typeFilter.toUpperCase()

      const res = await api.get('/tickets', { params })

      const mapped = res.data.data.map((ticket: any) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        project: ticket.project?.name ?? 'N/A',
        assignedTo: ticket.assignee
          ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
          : 'Unassigned',
        priority: ticket.priority.toLowerCase(),
        status: ticket.status.toLowerCase().replace(/_/g, '-'),
        type: ticket.type.toLowerCase(),
        createdDate: ticket.createdAt,
        reporterId: ticket.reporterId,
      }))

      setTickets(mapped)
      const p = res.data.pagination
      if (p) setPagination(p)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('restricted')
      } else {
        setError('failed')
      }
    } finally {
      setLoading(false)
    }
  }

  // When page changes (Next/Prev), fetch at the new page.
  // When filters/search change, reset page to 1 first — the page change then triggers the fetch.
  useEffect(() => {
    fetchTickets()
  }, [page])

  useEffect(() => {
    if (page !== 1) {
      setPage(1) // triggers the page useEffect above to fetch
    } else {
      fetchTickets() // already on page 1, fetch directly
    }
  }, [projectFilter, assignedToFilter, priorityFilter, statusFilter, typeFilter])

  if (error === 'restricted') {
    return <div>🔒 Restricted Access</div>
  }

  if (error === 'failed') {
    return <div>Failed to load tickets</div>
  }

  return (
    <div>
      <TicketFilters
        projectFilter={projectFilter}
        assignedToFilter={assignedToFilter}
        priorityFilter={priorityFilter}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        projects={['all', ...projects.map(p => ({ id: p.id, name: p.name }))]}
        employees={['all', ...employees]}
        onProjectChange={setProjectFilter}
        onAssignedToChange={setAssignedToFilter}
        onPriorityChange={setPriorityFilter}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
        onCreateTicket={() => navigate('/app/tickets/create')}
        userRole={user?.role}
      />

      {loading && tickets.length === 0 ? (
        <div>Loading tickets...</div>
      ) : (
        <TicketsTable tickets={tickets} currentUserId={user?.id} />
      )}

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
    </div>
  )
}

export default TicketsPage