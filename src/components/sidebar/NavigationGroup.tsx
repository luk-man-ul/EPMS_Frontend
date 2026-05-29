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
  isMobile?: boolean;
}

export function NavigationGroup({ 
  group, 
  role, 
  activePath, 
  onNavigate,
  onClose,
  sidebarExpanded = false,
  isMobile = false
}: NavigationGroupProps) {

  // Filter items based on user role
  const filteredItems = group.items.filter(item => 
    item.roles.includes(role)
  );

  // Don't render if no items are visible
  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: sidebarExpanded ? '17px' : '16px' }}>
      {/* Section Title or Divider — same vertical space in both states */}
      {sidebarExpanded ? (
        <div style={{
          paddingLeft: isMobile ? '24px' : '63px',
          paddingTop: '2px',
          paddingBottom: '6px',
          fontSize: '10px',
          fontWeight: 700,
          color: '#bbb',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          lineHeight: '14px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}>
          {group.title}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: '22px',
          padding: '0 16px',
        }}>
          <div style={{
            flex: 1,
            height: '1px',
            background: 'rgba(0,0,0,0.10)',
          }} />
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
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
}