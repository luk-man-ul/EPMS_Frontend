import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, logout } from '../../utils/auth'

interface AdminHeaderProps {
  onMenuClick?: () => void
}

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px',
            color: '#1a1a1a',
          }}
        >
          ☰
        </button>

        <input
          type="text"
          placeholder="Search..."
          className="header-search"
        />
      </div>

      <div className="header-actions">
        🔔
        <div style={{ position: 'relative' }}>
          <div 
            className="profile"
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ cursor: 'pointer' }}
          >
            {user?.email || 'Admin'}
          </div>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: '#ffffff',
              border: '1px solid #e5e5e5',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              minWidth: '180px',
              zIndex: 1000,
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e5e5e5',
                fontSize: '13px',
              }}>
                <div style={{ fontWeight: 600, color: '#1a1a1a' }}>
                  {user?.email}
                </div>
                <div style={{ color: '#666666', fontSize: '12px', marginTop: '2px' }}>
                  {user?.email}
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '13px',
                  color: '#c53030',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
