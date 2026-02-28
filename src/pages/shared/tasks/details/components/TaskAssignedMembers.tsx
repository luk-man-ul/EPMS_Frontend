const TaskAssignedMembers = () => {
  const members = [
    { id: '1', name: 'David Kumar', role: 'Lead Developer' },
    { id: '2', name: 'James Wilson', role: 'QA Engineer' }
  ]

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
          Assigned Members
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
          + Add
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {members.map(member => (
          <div
            key={member.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#fafafa',
              borderRadius: '8px'
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              {member.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
                {member.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {member.role}
              </div>
            </div>
            <button
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #e5e5e5',
                background: '#fff',
                fontSize: '12px',
                color: '#666',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fff'
                e.currentTarget.style.color = '#1a1a1a'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff'
                e.currentTarget.style.color = '#666'
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskAssignedMembers
