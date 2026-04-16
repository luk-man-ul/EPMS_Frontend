import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/sidebar/Sidebar'
import type { UserRole } from '../components/sidebar/navigation-config'
import AppHeader from '../components/header/AppHeader'
import { useAuth } from '../context/AuthContext'

const AppLayout = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  // Map user role to Sidebar UserRole type
  const userRole = (user?.role as UserRole) || 'EMPLOYEE'

  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.classList.add('sidebar-open')
    } else {
      document.body.classList.remove('sidebar-open')
    }
    return () => document.body.classList.remove('sidebar-open')
  }, [isMobileSidebarOpen])

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
        <AppHeader onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
        <div className="content">
          <Outlet />
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="mobile-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 190,
          }}
        />
      )}
    </div>
  )
}

export default AppLayout
