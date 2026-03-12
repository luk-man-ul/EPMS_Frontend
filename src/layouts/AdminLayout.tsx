import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/sidebar/Sidebar'
import type { UserRole } from '../components/sidebar/navigation-config'
import AdminHeader from '../components/header/AdminHeader'
import { useAuth } from '../context/AuthContext'

const AdminLayout = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  // Map user role to Sidebar UserRole type
  const userRole = (user?.role as UserRole) || 'ADMIN'

  return (
    <div className="layout">
      <Sidebar 
        role={userRole}
        currentPath={location.pathname}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onExpandChange={setIsSidebarExpanded}
      />

      <div className={`main main-collapsible ${isSidebarExpanded ? 'expanded' : ''}`}>
        <AdminHeader onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
        <div className="content">
          <Outlet />
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 190,
            display: 'none',
          }}
          className="mobile-overlay"
        />
      )}
    </div>
  )
}

export default AdminLayout
