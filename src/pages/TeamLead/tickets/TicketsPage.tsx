import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../utils/api'
import TicketFilters from './components/TicketFilters'
import TicketsTable from './components/TicketsTable'

const TicketsPage = () => {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [projectFilter, setProjectFilter] = useState('all')
  const [assignedToFilter, setAssignedToFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {}

      if (statusFilter !== 'all') params.status = statusFilter.toUpperCase()
      if (priorityFilter !== 'all') params.priority = priorityFilter.toUpperCase()
      if (projectFilter !== 'all') params.projectId = projectFilter
      if (assignedToFilter !== 'all') params.assignedToId = assignedToFilter

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
      }))

      setTickets(mapped)
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

  useEffect(() => {
    fetchTickets()
  }, [projectFilter, assignedToFilter, priorityFilter, statusFilter, typeFilter])

  if (loading) return <div>Loading tickets...</div>

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
        projects={['all']}
        employees={['all']}
        onProjectChange={setProjectFilter}
        onAssignedToChange={setAssignedToFilter}
        onPriorityChange={setPriorityFilter}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
        onCreateTicket={() => navigate('/app/tickets/create')}
      />

      <TicketsTable tickets={tickets} />
    </div>
  )
}

export default TicketsPage