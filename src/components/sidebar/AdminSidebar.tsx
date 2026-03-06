import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { hasPermission } from '../../utils/hasPermission'

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const menuItems = [
  { label: 'Dashboard', path: '/admin/dashboard', permission: 'dashboard.view' },
  { label: 'Employees', path: '/admin/employees', permission: 'employees.view' },
  { label: 'Projects', path: '/admin/projects', permission: 'projects.view' },
  { label: 'Tasks', path: '/admin/tasks', permission: 'tasks.view' },
  { label: 'Tickets', path: '/admin/tickets', permission: 'tasks.view' },
  { label: 'Work Approval', path: '/admin/work-approval', permission: 'tasks.approve' },
  { label: 'Attendance', path: '/admin/attendance', permission: 'dashboard.view' },
  { label: 'Finance', path: '/admin/finance', permission: 'finance.view' },
  { label: 'Reports', path: '/admin/reports', permission: 'reports.view' },
  { label: 'Notifications', path: '/admin/notifications', permission: 'dashboard.view' },
  { label: 'Settings', path: '/admin/settings', permission: 'settings.view' },
]

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const { user } = useAuth()

  // 🔥 ADMIN sees everything
  const filteredMenu =
    user?.role === 'ADMIN'
      ? menuItems
      : menuItems.filter(item =>
          hasPermission(user?.permissions || [], item.permission)
        )

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '20px' }}>
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
          EPMS
        </h2>

        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="mobile-close-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px',
            color: '#666',
          }}
        >
          ✕
        </button>
      </div>

      <nav className="sidebar-nav">
        {filteredMenu.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
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

export default AdminSidebar
