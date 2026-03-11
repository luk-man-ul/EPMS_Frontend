import { NavLink } from 'react-router-dom';
import type { NavigationItemConfig } from './navigation-config.ts';

interface NavigationItemProps {
  item: NavigationItemConfig;
  activePath: string;
  onNavigate?: (path: string) => void;
  onClose?: () => void;
}

export function NavigationItem({ item, activePath, onNavigate, onClose }: NavigationItemProps) {
  const isActive = activePath === item.path || activePath.startsWith(item.path + '/');

  const handleClick = () => {
    if (onNavigate) {
      onNavigate(item.path);
    }
    if (onClose) {
      onClose();
    }
  };

  const baseClasses = `
    flex items-center justify-between px-4 py-2 text-sm rounded-md
    transition-all duration-150
  `;

  const activeClasses = isActive
    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700 font-medium'
    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900';

  const disabledClasses = item.disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer';

  if (item.disabled) {
    return (
      <div className={`${baseClasses} ${activeClasses} ${disabledClasses}`}>
        <span className="flex items-center">
          {item.icon && <span className="mr-3">{getIcon(item.icon)}</span>}
          {item.label}
        </span>
        {item.badge && (
          <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-gray-200 text-gray-600 rounded-full">
            {typeof item.badge === 'function' ? item.badge() : item.badge}
          </span>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={handleClick}
      className={`${baseClasses} ${activeClasses} ${disabledClasses}`}
    >
      <span className="flex items-center">
        {item.icon && <span className="mr-3">{getIcon(item.icon)}</span>}
        {item.label}
      </span>
      {item.badge && (
        <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
          {typeof item.badge === 'function' ? item.badge() : item.badge}
        </span>
      )}
    </NavLink>
  );
}

// Simple icon mapping - can be replaced with a proper icon library later
function getIcon(iconName: string): string {
  const icons: Record<string, string> = {
    home: '🏠',
    folder: '📁',
    'check-square': '✓',
    users: '👥',
    'clipboard-check': '📋',
    ticket: '🎫',
    clock: '🕐',
    calendar: '📅',
    'calendar-plus': '📅+',
    list: '📝',
    'bar-chart': '📊',
    settings: '⚙️',
  };
  return icons[iconName] || '•';
}
