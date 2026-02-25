interface Summary {
  totalTasks?: number
  activeTasks?: number
  completedTasks?: number
  overdueTasks?: number
  completionRate?: number
  totalProjects?: number
  openTickets?: number
}

interface Props {
  summary: Summary
}

const SummaryCards = ({ summary }: Props) => {
 const cards = [
  { label: 'Projects', value: summary.totalProjects ?? 0, icon: '📁' },
  { label: 'Total Tasks', value: summary.totalTasks ?? 0, icon: '📊' },
  { label: 'Active Tasks', value: summary.activeTasks ?? 0, icon: '📝' },
  { label: 'Completed', value: summary.completedTasks ?? 0, icon: '✅' },
  { label: 'Overdue', value: summary.overdueTasks ?? 0, icon: '⚠️' },
  { label: 'Open Tickets', value: summary.openTickets ?? 0, icon: '🎫' },
]
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e5e5e5',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#d4d4d4'
            e.currentTarget.style.boxShadow =
              '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e5e5'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '24px' }}>{card.icon}</span>
            <div
              style={{
                fontSize: '13px',
                color: '#666666',
                fontWeight: 500,
              }}
            >
              {card.label}
            </div>
          </div>

          <div
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: '#1a1a1a',
              letterSpacing: '-0.02em',
            }}
          >
            {card.value}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SummaryCards