import { useLocation } from 'react-router-dom'
import { NavigationGroup } from './NavigationGroup.tsx'
import { navigationConfig, type UserRole } from './navigation-config.ts'
import { useSidebarState } from '../../hooks/useSidebarState.ts'

export interface SidebarProps {
  role: UserRole
  currentPath: string
  onNavigate?: (path: string) => void
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({
  role,
  currentPath,
  onNavigate,
  isOpen = false,
  onClose
}: SidebarProps) {

  const location = useLocation()
  const activePath = currentPath || location.pathname
  const { state, toggleGroup } = useSidebarState()

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
      className={`
        fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-40
        flex flex-col
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-900 tracking-wide hover:text-blue-600 transition-all duration-300 cursor-pointer">
          EPMS
        </h2>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700 text-2xl p-1"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        )}
      </div>

      {/* Role Badge */}
      <div className="px-6 py-3 flex-shrink-0">
        <div className="px-4 py-2 bg-gray-100 rounded-lg text-center">
          <span className="text-sm font-semibold text-gray-700 tracking-wide">
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Navigation (Scrollable) */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
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
          />
        ))}
      </nav>

    </aside>
  )
}