import type { Solution } from '../../../../../types/ticket'

interface TicketSolutionLogsProps {
  solutions: Solution[]
  onAddSolution?: (solution: string) => void
  onVerifySolution?: (solutionId: string) => void
}

const TicketSolutionLogs = ({ solutions, onAddSolution, onVerifySolution }: TicketSolutionLogsProps) => {
  const formatTimestamp = (date: string | Date) => {
    const d = new Date(date)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e5e5',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
          Solution Logs ({solutions.length})
        </h3>
        {onAddSolution && (
          <button
            onClick={() => {
              const solution = prompt('Enter solution:')
              if (solution) onAddSolution(solution)
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              background: '#fff',
              fontSize: '13px',
              fontWeight: 500,
              color: '#1a1a1a',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
          >
            + Add Solution
          </button>
        )}
      </div>

      {solutions.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '32px', 
          color: '#999',
          fontSize: '14px',
          background: '#fafafa',
          borderRadius: '8px'
        }}>
          No solutions logged yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {solutions.map(solution => (
          <div
            key={solution.id}
            style={{
              padding: '16px',
              background: '#fafafa',
              borderRadius: '8px',
              border: solution.verified ? '2px solid #1a1a1a' : 'none'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
                  {solution.author ? `${solution.author.firstName} ${solution.author.lastName}` : 'Unknown'}
                </div>
                {solution.verified && (
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 500,
                    backgroundColor: '#1a1a1a',
                    color: '#fff'
                  }}>
                    ✓ Verified
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {formatTimestamp(solution.createdAt)}
              </div>
            </div>
            
            <div style={{ 
              fontSize: '14px', 
              color: '#666', 
              lineHeight: '1.5',
              marginBottom: '12px'
            }}>
              {solution.solution}
            </div>

            {!solution.verified && onVerifySolution && (
              <button
                onClick={() => onVerifySolution(solution.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e5e5e5',
                  background: '#fff',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#1a1a1a',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a1a'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff'
                  e.currentTarget.style.color = '#1a1a1a'
                }}
              >
                Mark as Verified
              </button>
            )}
          </div>
        ))}
      </div>
      )}
    </div>
  )
}

export default TicketSolutionLogs
