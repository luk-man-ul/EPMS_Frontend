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
  sidebarExpanded?: boolean;
}

export function NavigationGroup({ 
  group, 
  role, 
  activePath, 
  onNavigate,
  onClose,
  isExpanded,
  onToggle,
  sidebarExpanded = false
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

  return (
    <div style={{ marginBottom: sidebarExpanded ? '32px' : '20px' }}>
      {/* Section Title - Only show when expanded */}
      {sidebarExpanded && (
        <div style={{
          padding: '0 20px 12px 20px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#999',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          opacity: sidebarExpanded ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}>
          {group.title}
        </div>
      )}

      {/* Section Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {filteredItems.map(item => (
          <NavigationItem
            key={item.id}
            item={item}
            activePath={activePath}
            onNavigate={onNavigate}
            onClose={onClose}
            sidebarExpanded={sidebarExpanded}
          />
        ))}
      </div>
    </div>
  );
}