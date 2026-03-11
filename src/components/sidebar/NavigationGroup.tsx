import { NavigationItem } from './NavigationItem.tsx';
import type { NavigationGroupConfig, UserRole } from './navigation-config.ts';

interface NavigationGroupProps {
  group: NavigationGroupConfig;
  role: UserRole;
  activePath: string;
  onNavigate?: (path: string) => void;
  onClose?: () => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function NavigationGroup({ 
  group, 
  role, 
  activePath, 
  onNavigate,
  onClose,
  isExpanded,
  onToggle
}: NavigationGroupProps) {
  // Use centralized state if provided, otherwise fall back to default
  const expanded = isExpanded !== undefined ? isExpanded : group.defaultExpanded;

  // Filter items based on user role
  const filteredItems = group.items.filter(item => 
    item.roles.includes(role)
  );

  // Don't render if no items are visible
  if (filteredItems.length === 0) {
    return null;
  }

  const toggleExpanded = () => {
    if (group.collapsible && onToggle) {
      onToggle();
    }
  };

  return (
    <div className="mb-4">
      {/* Group Header */}
      <button
        onClick={toggleExpanded}
        className={`
          w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700
          ${group.collapsible ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}
          rounded-md transition-colors duration-150
        `}
        disabled={!group.collapsible}
      >
        <span className="uppercase tracking-wider">{group.title}</span>
        {group.collapsible && (
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Group Items */}
      {expanded && (
        <div className="mt-1 space-y-1">
          {filteredItems.map(item => (
            <NavigationItem
              key={item.id}
              item={item}
              activePath={activePath}
              onNavigate={onNavigate}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  );
}
