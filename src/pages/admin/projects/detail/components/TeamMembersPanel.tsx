const TeamMembersPanel = () => {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>
          Team Members
        </h3>

        <button
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #e5e5e5',
            backgroundColor: '#fff',
            color: '#1a1a1a',
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          + Add Member
        </button>
      </div>

      <div
        style={{
          padding: '40px',
          background: '#fafafa',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#666',
        }}
      >
        Members will be loaded from backend.
      </div>
    </div>
  )
}

export default TeamMembersPanel