import { NavLink } from 'react-router-dom';
import type { ReactElement } from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  Ticket, 
  Clock, 
  Calendar, 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  Timer, 
  MessageCircle, 
  User, 
  Settings, 
  PieChart,
  FileText,
  Umbrella,
  ClipboardList,
  TrendingUp
} from 'lucide-react';
import type { NavigationItemConfig } from './navigation-config.ts';

interface NavigationItemProps {
  item: NavigationItemConfig;
  activePath: string;
  onNavigate?: (path: string) => void;
  onClose?: () => void;
  sidebarExpanded?: boolean;
}

export function NavigationItem({ item, activePath, onNavigate, onClose, sidebarExpanded = false }: NavigationItemProps) {
  const isActive = activePath === item.path;

  const handleClick = () => {
    if (onNavigate) onNavigate(item.path);
    if (onClose) onClose();
  };

  if (item.disabled) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        padding: '10px 15px',
        margin: '0 8px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 500,
        color: '#999',
        opacity: 0.5,
        cursor: 'not-allowed',
        justifyContent: sidebarExpanded ? 'flex-start' : 'center',
        transition: 'all 0.3s ease'
      }}>
        <span style={{ 
          width: '40px',
          minWidth: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarExpanded ? 'flex-start' : 'center',
          flexShrink: 0
        }}>
          {getIcon(item.icon)}
        </span>
        <span style={{ 
          flex: 1,
          minWidth: 0,
          opacity: sidebarExpanded ? 1 : 0,
          transform: sidebarExpanded ? 'translateX(0)' : 'translateX(-6px)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          pointerEvents: 'none',
        }}>
          {item.label}
        </span>
        {item.badge && (
          <span style={{
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 600,
            background: '#f3f4f6',
            color: '#666',
            borderRadius: '12px',
            opacity: sidebarExpanded ? 1 : 0,
            transition: 'opacity 0.25s ease',
            flexShrink: 0,
          }}>
            {item.badge}
          </span>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      end
      onClick={handleClick}
      style={({ isActive: linkActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        padding: '10px 15px',
        margin: '0 8px',
        borderRadius: '12px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 500,
        color: (isActive || linkActive) ? '#ffffff' : '#666',
        background: (isActive || linkActive)
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          : 'transparent',
        boxShadow: (isActive || linkActive) ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        justifyContent: sidebarExpanded ? 'flex-start' : 'center',
      })}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = '#f8f9fa';
          e.currentTarget.style.color = '#1a1a1a';
          if (sidebarExpanded) e.currentTarget.style.transform = 'translateX(4px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#666';
          e.currentTarget.style.transform = 'translateX(0)';
        }
      }}
    >
      <span style={{ 
        width: '40px',
        minWidth: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarExpanded ? 'flex-start' : 'center',
        flexShrink: 0
      }}>
        {getIcon(item.icon)}
      </span>
      <span style={{ 
        flex: 1,
        minWidth: 0,
        opacity: sidebarExpanded ? 1 : 0,
        transform: sidebarExpanded ? 'translateX(0)' : 'translateX(-6px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        pointerEvents: 'none',
      }}>
        {item.label}
      </span>
      {item.badge && (
        <span style={{
          padding: '2px 8px',
          fontSize: '11px',
          fontWeight: 600,
          background: isActive ? 'rgba(255, 255, 255, 0.2)' : '#e0f2fe',
          color: isActive ? '#ffffff' : '#0369a1',
          borderRadius: '12px',
          opacity: sidebarExpanded ? 1 : 0,
          transition: 'opacity 0.25s ease',
          flexShrink: 0,
        }}>
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}

function getIcon(iconName?: string): ReactElement {
  const iconProps = { size: 18, strokeWidth: 2 };

  const iconMap: Record<string, ReactElement> = {
    'dashboard': <LayoutDashboard {...iconProps} />,
    '📊': <LayoutDashboard {...iconProps} />,
    'projects': <FolderOpen {...iconProps} />,
    '📁': <FolderOpen {...iconProps} />,
    'tasks': <CheckSquare {...iconProps} />,
    '✓': <CheckSquare {...iconProps} />,
    'approval': <ClipboardCheck {...iconProps} />,
    '✅': <ClipboardCheck {...iconProps} />,
    'tickets': <Ticket {...iconProps} />,
    '🎫': <Ticket {...iconProps} />,
    'clock': <Clock {...iconProps} />,
    '⏰': <Clock {...iconProps} />,
    'calendar': <Calendar {...iconProps} />,
    '📅': <Calendar {...iconProps} />,
    'timer': <Timer {...iconProps} />,
    '⏱️': <Timer {...iconProps} />,
    'umbrella': <Umbrella {...iconProps} />,
    '🏖️': <Umbrella {...iconProps} />,
    'clipboard': <ClipboardList {...iconProps} />,
    '📋': <ClipboardList {...iconProps} />,
    'file-text': <FileText {...iconProps} />,
    '📝': <FileText {...iconProps} />,
    'users': <Users {...iconProps} />,
    '👥': <Users {...iconProps} />,
    'user': <User {...iconProps} />,
    '👤': <User {...iconProps} />,
    'message': <MessageCircle {...iconProps} />,
    '💬': <MessageCircle {...iconProps} />,
    'settings': <Settings {...iconProps} />,
    '⚙️': <Settings {...iconProps} />,
    'reports': <BarChart3 {...iconProps} />,
    '📈': <TrendingUp {...iconProps} />,
    'analytics': <PieChart {...iconProps} />,
  };

  return iconMap[iconName || ''] || <ClipboardList {...iconProps} />;
}
