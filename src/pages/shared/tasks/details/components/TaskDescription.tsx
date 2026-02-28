const TaskDescription = () => {
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
          Description
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
          Edit
        </button>
      </div>

      <p style={{ 
        fontSize: '14px', 
        color: '#666', 
        lineHeight: '1.6',
        marginBottom: '20px'
      }}>
        Build a comprehensive JWT-based authentication system with refresh tokens and role-based access control. 
        The system should support user registration, login, logout, and password reset functionality. 
        Implement middleware for protecting routes and validating user permissions.
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #f5f5f5'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            Created
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
            2026-02-05
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            Deadline
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
            2026-02-20
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            Estimated Hours
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
            40 hours
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            Time Logged
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
            10 hours
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDescription
