import { useState, useEffect } from 'react'

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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
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
    <>
      {isMobile && (
        <style>{`
          .work-stats-container::-webkit-scrollbar {
            display: none;
          }
          .work-stats-container {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        `}</style>
      )}
      <div 
        className={isMobile ? "work-stats-container" : undefined}
        style={isMobile ? {
          display: 'flex',
          overflowX: 'auto',
          gap: '12px',
          paddingBottom: '10px',
          marginBottom: '16px',
          width: '100%',
          WebkitOverflowScrolling: 'touch',
        } : {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            style={isMobile ? {
              background: '#ffffff',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid #e5e5e5',
              flex: '0 0 130px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            } : {
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
              marginBottom: isMobile ? '6px' : '8px',
            }}>
              <div style={{
                width: isMobile ? '28px' : '32px',
                height: isMobile ? '28px' : '32px',
                borderRadius: '8px',
                background: stat.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '14px' : '16px',
              }}>
                {stat.icon}
              </div>
            </div>
            <div style={{
              fontSize: isMobile ? '20px' : '22px',
              fontWeight: 700,
              color: stat.color,
              marginBottom: '2px',
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: isMobile ? '11px' : '12px',
              color: '#666666',
              fontWeight: 500,
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default StatsCards
