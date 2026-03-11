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

  // Map user role to Sidebar UserRole type
  const userRole = (user?.role as UserRole) || 'ADMIN'

  return (
    <div className="layout">
      <Sidebar 
        role={userRole}
        currentPath={location.pathname}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="main">
        <AdminHeader onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
        <div className="content">
          <Outlet />
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        />
      )}
    </div>
  )
}

export default AdminLayout
