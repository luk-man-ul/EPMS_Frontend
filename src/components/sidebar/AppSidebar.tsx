import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { hasPermission } from '../../utils/hasPermission'
  
const menuItems = [
  { label: 'Dashboard', path: '/App/dashboard', permission: 'dashboard.view' },
  { label: 'My Projects', path: '/App/projects', permission: 'projects.view' },
  { label: 'Team Tasks', path: '/App/tasks', permission: 'tasks.view' },
  { label: 'Ticket Center', path: '/App/tickets', permission: 'tasks.view' }, // adjust later
  { label: 'Work Approval', path: '/App/work-approval', permission: 'tasks.update' },
  { label: 'Team Attendance', path: '/App/attendance', permission: 'dashboard.view' }, // temp
  { label: 'Time Logs', path: '/App/time-logs', permission: 'tasks.view' }, // temp
  { label: 'Project Finance', path: '/App/finance', permission: 'finance.view' },
  { label: 'Reports', path: '/App/reports', permission: 'reports.view' },
  { label: 'Team Chat', path: '/App/chat', permission: 'dashboard.view' }, // temp
  { label: 'Profile & Settings', path: '/App/settings', permission: 'settings.view' },
]

const AppSidebar = () => {
  const { user } = useAuth()

  const filteredMenu = menuItems.filter(item =>
    hasPermission(user?.permissions, item.permission)
  )

  // Determine workspace label based on role
  const workspaceLabel = user?.role === 'EMPLOYEE' ? 'Employee' : 'Team Lead'

  return (
    <aside className="sidebar">
      <h2 
        className="sidebar-title"
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#1a1a1a',
          letterSpacing: '0.5px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#4a90e2'
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.letterSpacing = '1px'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#1a1a1a'
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.letterSpacing = '0.5px'
        }}
      >
        ISPM
      </h2>

      {/* Workspace Label */}
      <div style={{
        padding: '12px 20px',
        marginTop: '8px',
        marginBottom: '16px',
        background: '#f5f5f5',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
        color: '#666666',
        textAlign: 'center',
        letterSpacing: '0.5px',
      }}>
        {workspaceLabel}
      </div>

      <nav className="sidebar-nav">
        {filteredMenu.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default AppSidebar
