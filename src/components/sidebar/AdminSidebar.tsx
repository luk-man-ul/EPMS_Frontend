import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { hasPermission } from '../../utils/hasPermission'

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const menuSections = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard', permission: 'dashboard.view', icon: '📊' },
    ]
  },
  {
    title: 'Management',
    items: [
      { label: 'Employees', path: '/admin/employees', permission: 'employees.view', icon: '👥' },
      { label: 'Projects', path: '/admin/projects', permission: 'projects.view', icon: '📁' },
      { label: 'Tasks', path: '/admin/tasks', permission: 'tasks.view', icon: '✅' },
      { label: 'Tickets', path: '/admin/tickets', permission: 'tasks.view', icon: '🎫' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { label: 'Work Approval', path: '/admin/work-approval', permission: 'tasks.approve', icon: '✔️' },
      { label: 'Attendance', path: '/admin/attendance', permission: 'dashboard.view', icon: '📅' },
      { label: 'Finance', path: '/admin/finance', permission: 'finance.view', icon: '💰' },
    ]
  },
  {
    title: 'System',
    items: [
      { label: 'Reports', path: '/admin/reports', permission: 'reports.view', icon: '📈' },
      { label: 'Notifications', path: '/admin/notifications', permission: 'dashboard.view', icon: '🔔' },
      { label: 'Settings', path: '/admin/settings', permission: 'settings.view', icon: '⚙️' },
    ]
  }
]

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const { user } = useAuth()

  // Filter sections based on permissions
  const filteredSections = menuSections.map(section => ({
    ...section,
    items: user?.role === 'ADMIN' 
      ? section.items 
      : section.items.filter(item => hasPermission(user?.permissions || [], item.permission))
  })).filter(section => section.items.length > 0)

  return (
    <aside className={`sidebar-modern ${isOpen ? 'mobile-open' : ''}`}>
      {/* Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 700,
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}>
            E
          </div>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#1a1a1a',
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              EPMS
            </h2>
            <p style={{
              fontSize: '12px',
              color: '#666',
              margin: 0,
              fontWeight: 500
            }}>
              Admin Panel
            </p>
          </div>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="mobile-close-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px',
            color: '#666',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f5f5f5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none'
          }}
        >
          ✕
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ 
        padding: '20px 0',
        flex: 1,
        overflowY: 'auto'
      }}>
        {filteredSections.map((section, sectionIndex) => (
          <div key={section.title} style={{ marginBottom: '32px' }}>
            {/* Section Title */}
            <div style={{
              padding: '0 20px 12px 20px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {section.title}
            </div>

            {/* Section Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `sidebar-link-modern ${isActive ? 'active' : ''}`}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 20px',
                    margin: '0 12px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: isActive ? '#ffffff' : '#666',
                    background: isActive 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : 'transparent',
                    boxShadow: isActive ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  })}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.classList.contains('active')) {
                      e.currentTarget.style.background = '#f8f9fa'
                      e.currentTarget.style.color = '#1a1a1a'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.classList.contains('active')) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#666'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }
                  }}
                >
                  <span style={{ 
                    fontSize: '16px',
                    minWidth: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </span>
                  <span style={{ flex: 1 }}>
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid #f0f0f0',
        background: '#fafafa'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e5e5'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 700,
            color: '#ffffff'
          }}>
            {user?.firstName?.[0] || 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#1a1a1a',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#666',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              Administrator
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar