import { taskTimeLogsData } from '../../data/tasksData'

const TaskTimeLogs = () => {
  const totalHours = taskTimeLogsData.reduce((sum, log) => sum + log.hours, 0)

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
          Time Logs
        </h3>
        <button
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
          + Log Time
        </button>
      </div>

      {/* Total Hours */}
      <div style={{
        padding: '16px',
        background: '#1a1a1a',
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
          Total Time Logged
        </div>
        <div style={{ fontSize: '24px', fontWeight: 600, color: '#fff' }}>
          {totalHours} hours
        </div>
      </div>

      {/* Time Logs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {taskTimeLogsData.map(log => (
          <div
            key={log.id}
            style={{
              padding: '12px',
              background: '#fafafa',
              borderRadius: '8px'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '6px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
                {log.user}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                {log.hours}h
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              {log.date}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              {log.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskTimeLogs
