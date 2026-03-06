import { useEffect, useState } from 'react'
import api from '../../../../../utils/api'

interface Props {
  project: any
}

const ProjectSummary = ({ project }: Props) => {
  const [status, setStatus] = useState(project?.status)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    setStatus(project?.status)
  }, [project])

  if (!project) return null

  const hasOpenTasks =
    project.tasks?.some(
      (task: any) => task.status !== 'COMPLETED'
    ) ?? false

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true)

      const res = await api.patch(
        `/projects/${project.id}/status`,
        { status: newStatus }
      )

      setStatus(res.data.status)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || ''
    const last = lastName?.[0] || ''
    return (first + last).toUpperCase() || '?'
  }

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

  const members = project.members || []
  const owner = project.owner

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Project Info Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '24px'
      }}>

        {/* Description Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          padding: '24px',
          minHeight: '160px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1a1a1a',
              margin: 0
            }}>
              Description
            </h3>
            <span style={{ fontSize: '20px' }}>📝</span>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.6',
            margin: 0
          }}>
            {project.description || 'No description available'}
          </p>
        </div>

        {/* Timeline Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1a1a1a',
              margin: 0
            }}>
              Timeline
            </h3>
            <span style={{ fontSize: '20px' }}>📅</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: '#fafafa',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>
                Start Date
              </span>
              <span style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: 600 }}>
                {formatDate(project.startDate)}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: '#fafafa',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>
                Deadline
              </span>
              <span style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: 600 }}>
                {formatDate(project.endDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1a1a1a',
              margin: 0
            }}>
              Status
            </h3>
            <span style={{ fontSize: '20px' }}>📊</span>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize: '13px',
              color: '#666',
              fontWeight: 500,
              display: 'block',
              marginBottom: '8px'
            }}>
              Current Status
            </label>

            <select
              value={status}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                fontWeight: 500,
                color: '#1a1a1a',
                background: '#ffffff',
                cursor: updating ? 'not-allowed' : 'pointer',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED" disabled={hasOpenTasks}>
                Completed {hasOpenTasks ? '(Open tasks exist)' : ''}
              </option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {hasOpenTasks && status !== 'COMPLETED' && (
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#b45309',
                padding: '8px 12px',
                background: '#fef3c7',
                borderRadius: '6px',
                border: '1px solid #fde68a'
              }}>
                ⚠️ Cannot complete project until all tasks are finished
              </div>
            )}
          </div>

          <div style={{
            padding: '16px',
            background: '#fafafa',
            borderRadius: '8px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>
                Progress
              </span>
              <span style={{ fontSize: '16px', color: '#1a1a1a', fontWeight: 700 }}>
                {project.progress || 0}%
              </span>
            </div>

            <div style={{
              height: '10px',
              background: '#e5e5e5',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${project.progress || 0}%`,
                background: '#1a1a1a',
                transition: 'width 0.3s ease',
                borderRadius: '5px'
              }} />
            </div>
          </div>
        </div>

        {/* Budget Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1a1a1a',
              margin: 0
            }}>
              Budget
            </h3>
            <span style={{ fontSize: '20px' }}>💰</span>
          </div>

          <div style={{
            padding: '20px',
            background: '#fafafa',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '13px',
              color: '#666',
              fontWeight: 500,
              marginBottom: '8px'
            }}>
              Total Budget
            </div>
            <div style={{
              fontSize: '32px',
              color: '#1a1a1a',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}>
              {formatCurrency(project.budget || 0)}
            </div>
          </div>
        </div>

      </div>

      {/* Team Members Section */}
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 600, 
            color: '#1a1a1a',
            marginBottom: '8px'
          }}>
            Team Members ({members.length})
          </h3>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Project team and their roles
          </p>
        </div>

        {/* Project Owner Card */}
        {owner && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '16px' }}>👑</span>
              <h4 style={{ 
                fontSize: '15px', 
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
              padding: '20px',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 700,
                  border: '3px solid rgba(255, 255, 255, 0.3)'
                }}>
                  {getInitials(owner.firstName, owner.lastName)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: 600, 
                    margin: '0 0 6px 0',
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
            padding: '48px 32px', 
            background: '#fafafa', 
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px dashed #e5e5e5'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
            <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>
              No team members assigned yet
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {members.map((m: any) => (
              <div 
                key={m.userId} 
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e5e5e5',
                  padding: '18px',
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
                  marginBottom: '14px'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#ffffff',
                    flexShrink: 0
                  }}>
                    {getInitials(m.user?.firstName, m.user?.lastName)}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ 
                      fontSize: '15px', 
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
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
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
                  gap: '8px',
                  paddingTop: '14px',
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
                    marginTop: '14px',
                    paddingTop: '14px',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <div style={{ 
                      fontSize: '10px', 
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
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
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
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
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

    </div>
  )
}

export default ProjectSummary
