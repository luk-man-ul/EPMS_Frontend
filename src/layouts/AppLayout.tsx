import { useState } from 'react'
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
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <AppHeader />
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

export default AppLayout
