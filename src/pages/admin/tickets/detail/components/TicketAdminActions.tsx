const TicketAdminActions = () => {
  return (
    <div style={{
      background: '#1a1a1a',
      borderRadius: '12px',
      padding: '20px 24px',
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginRight: '8px' }}>
        Admin Privileges:
      </div>
      
      <div style={{ 
        fontSize: '13px', 
        color: 'rgba(255,255,255,0.8)',
        padding: '8px 16px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        ✓ Change any status without restrictions
      </div>

      <div style={{ 
        fontSize: '13px', 
        color: 'rgba(255,255,255,0.8)',
        padding: '8px 16px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        ✓ Reassign tickets at any time
      </div>

      <div style={{ 
        fontSize: '13px', 
        color: 'rgba(255,255,255,0.8)',
        padding: '8px 16px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        ✓ Bypass assignment requirements
      </div>
    </div>
  )
}

export default TicketAdminActions
