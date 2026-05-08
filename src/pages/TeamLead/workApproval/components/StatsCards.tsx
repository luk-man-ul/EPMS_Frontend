type StatsCardsProps = {
  totalPending: number
  totalApproved: number
  totalRejected: number
  avgProcessingTime: string
}

const StatsCards = ({ 
  totalPending, 
  totalApproved, 
  totalRejected, 
  avgProcessingTime 
}: StatsCardsProps) => {
  const stats = [
    {
      label: 'Pending Approvals',
      value: totalPending,
      icon: '⏳',
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
    {
      label: 'Approved',
      value: totalApproved,
      icon: '✓',
      color: '#10b981',
      bgColor: '#d1fae5',
    },
    {
      label: 'Rejected',
      value: totalRejected,
      icon: '✕',
      color: '#ef4444',
      bgColor: '#fee2e2',
    },
    {
      label: 'Avg Processing Time',
      value: avgProcessingTime,
      icon: '⏱️',
      color: '#6366f1',
      bgColor: '#e0e7ff',
    },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '12px',
      marginBottom: '24px',
    }}>
      {stats.map((stat, index) => (
        <div
          key={index}
          style={{
            background: '#ffffff',
            padding: '14px 16px',
            borderRadius: '10px',
            border: '1px solid #e5e5e5',
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: stat.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}>
              {stat.icon}
            </div>
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: 700,
            color: stat.color,
            marginBottom: '2px',
          }}>
            {stat.value}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#666666',
            fontWeight: 500,
          }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards
