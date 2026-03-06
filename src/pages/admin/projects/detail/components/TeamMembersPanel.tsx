interface Props {
  project: any
}

const TeamMembersPanel = ({ project }: Props) => {
  const members = project.members || []
  const owner = project.owner

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }
      case 'TEAM_LEAD':
        return { backgroundColor: '#dbeafe', color: '#1e3a8a', border: '1px solid #bfdbfe' }
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }
    }
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || ''
    const last = lastName?.[0] || ''
    return (first + last).toUpperCase() || '?'
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 600, 
          color: '#1a1a1a',
          marginBottom: '8px'
        }}>
          Team Members ({members.length})
        </h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Manage project team and their roles
        </p>
      </div>

      {/* Project Owner Card */}
      {owner && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '18px' }}>👑</span>
            <h4 style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              color: '#1a1a1a',
              margin: 0
            }}>
              Project Owner
            </h4>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '24px',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 700,
                border: '3px solid rgba(255, 255, 255, 0.3)'
              }}>
                {getInitials(owner.firstName, owner.lastName)}
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: 600, 
                  margin: '0 0 8px 0',
                  color: '#ffffff'
                }}>
                  {owner.firstName} {owner.lastName}
                </h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontSize: '14px',
                  opacity: 0.95
                }}>
                  <span>📧</span>
                  {owner.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Members Grid */}
      {members.length === 0 ? (
        <div style={{ 
          padding: '64px 40px', 
          background: '#fafafa', 
          borderRadius: '12px',
          textAlign: 'center',
          border: '2px dashed #e5e5e5'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <p style={{ color: '#999', fontSize: '15px', margin: 0 }}>
            No team members assigned yet
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {members.map((m: any) => (
            <div 
              key={m.userId} 
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e5e5e5',
                padding: '20px',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = '#d4d4d4'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = '#e5e5e5'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#ffffff',
                  flexShrink: 0
                }}>
                  {getInitials(m.user?.firstName, m.user?.lastName)}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 600, 
                    margin: '0 0 4px 0',
                    color: '#1a1a1a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {m.user?.firstName} {m.user?.lastName}
                  </h4>
                  
                  {m.user?.roles && m.user.roles.length > 0 && (
                    <span style={{
                      ...getRoleBadgeStyle(m.user.roles[0].role.name),
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'inline-block',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {m.user.roles[0].role.name}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px',
                paddingTop: '16px',
                borderTop: '1px solid #f0f0f0'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontSize: '13px',
                  color: '#666'
                }}>
                  <span>📧</span>
                  <span style={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {m.user?.email}
                  </span>
                </div>

                {m.user?.department && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    <span>💼</span>
                    <span>{m.user.department}</span>
                  </div>
                )}

                {m.user?.designation && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    <span>👤</span>
                    <span>{m.user.designation}</span>
                  </div>
                )}

                {m.joinedAt && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    <span>📅</span>
                    <span>
                      Joined {new Date(m.joinedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>

              {m.user?.skills && m.user.skills.length > 0 && (
                <div style={{ 
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#999', 
                    marginBottom: '8px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Skills
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '6px' 
                  }}>
                    {m.user.skills.slice(0, 3).map((skillObj: any) => (
                      <span
                        key={skillObj.skill.id}
                        style={{
                          background: '#e0f2fe',
                          color: '#0369a1',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 500
                        }}
                      >
                        {skillObj.skill.name}
                      </span>
                    ))}
                    {m.user.skills.length > 3 && (
                      <span style={{
                        background: '#f3f4f6',
                        color: '#666',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}>
                        +{m.user.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TeamMembersPanel
