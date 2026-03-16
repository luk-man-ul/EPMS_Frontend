import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { NavigationGroup } from './NavigationGroup.tsx'
import { navigationConfig, type UserRole } from './navigation-config.ts'
import { useSidebarState } from '../../hooks/useSidebarState.ts'


export interface SidebarProps {
  role: UserRole
  currentPath: string
  onNavigate?: (path: string) => void
  isOpen?: boolean
  onClose?: () => void
  onExpandChange?: (expanded: boolean) => void
}

export function Sidebar({
  role,
  currentPath,
  onNavigate,
  isOpen = false,
  onClose,
  onExpandChange
}: SidebarProps) {

  const location = useLocation()
  const activePath = currentPath || location.pathname
  const { state, toggleGroup } = useSidebarState()
  const [isExpanded, setIsExpanded] = useState(false)

  // Notify parent when expansion state changes
  const handleExpandChange = (expanded: boolean) => {
    setIsExpanded(expanded)
    if (onExpandChange) {
      onExpandChange(expanded)
    }
  }

  //////////////////////////////////////////////////////////
  // FILTER NAVIGATION BASED ON ROLE
  //////////////////////////////////////////////////////////

  const filteredGroups = navigationConfig.groups
    .filter(group => group.roles.includes(role))
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.roles.includes(role))
    }))
    .filter(group => group.items.length > 0)

  //////////////////////////////////////////////////////////
  // ROLE LABEL FORMAT
  //////////////////////////////////////////////////////////

  const roleLabel =
    role === 'TEAM_LEAD'
      ? 'Team Lead'
      : role.charAt(0) + role.slice(1).toLowerCase()

  //////////////////////////////////////////////////////////
  // COMPONENT
  //////////////////////////////////////////////////////////

  return (
    <aside
      className={`sidebar-collapsible ${isOpen ? 'mobile-open' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => handleExpandChange(true)}
      onMouseLeave={() => handleExpandChange(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: isExpanded ? '280px' : '70px',
        background: '#ffffff',
        borderRight: '1px solid #e5e5e5',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 200,
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.05)',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}
    >

      {/* Header */}
      <div style={{
        padding: '24px 15px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        minHeight: '88px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          justifyContent: isExpanded ? 'flex-start' : 'center',
        }}>
          <div style={{
            width: '40px',
            minWidth: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 700,
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            flexShrink: 0
          }}>
            <Building2 size={20} strokeWidth={2.5} />
          </div>
          
          <div style={{
            opacity: isExpanded ? 1 : 0,
            transform: isExpanded ? 'translateX(0)' : 'translateX(-10px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}>
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
              {roleLabel} Panel
            </p>
          </div>
        </div>

        {/* Close button for mobile */}
        {onClose && (
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
              transition: 'all 0.2s ease',
              position: 'absolute',
              right: '10px',
              top: '20px'
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
        )}
      </div>

      {/* Navigation (Scrollable) */}
      <nav
        className="sidebar-nav-scroll"
        style={{ 
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '20px 0'
      }}>
        {filteredGroups.map(group => (
          <NavigationGroup
            key={group.id}
            group={group}
            role={role}
            activePath={activePath}
            onNavigate={onNavigate}
            onClose={onClose}
            isExpanded={state.expandedGroups[group.id]}
            onToggle={() => toggleGroup(group.id)}
            sidebarExpanded={isExpanded}
          />
        ))}
      </nav>


    </aside>
  )
}