import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/sidebar/AdminSidebar'
import AdminHeader from '../components/header/AdminHeader'

const AdminLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="layout">
      <AdminSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

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
