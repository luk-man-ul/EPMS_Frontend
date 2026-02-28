import { taskStatusHistoryData } from '../../data/tasksData'

const TaskStatusHistory = () => {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e5e5',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
        Status History
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {taskStatusHistoryData.map((history, index) => (
          <div key={history.id} style={{ position: 'relative', paddingLeft: '24px' }}>
            {/* Timeline dot */}
            <div style={{
              position: 'absolute',
              left: '0',
              top: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: index === taskStatusHistoryData.length - 1 ? '#1a1a1a' : '#e5e5e5'
            }} />
            
            {/* Timeline line */}
            {index < taskStatusHistoryData.length - 1 && (
              <div style={{
                position: 'absolute',
                left: '3.5px',
                top: '12px',
                width: '1px',
                height: 'calc(100% + 4px)',
                backgroundColor: '#f5f5f5'
              }} />
            )}

            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a', marginBottom: '2px' }}>
                {history.status.replace('_', ' ')}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {history.changedBy} • {history.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskStatusHistory
