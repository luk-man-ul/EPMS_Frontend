import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  Ticket, 
  Clock, 
  Calendar, 
  CalendarPlus, 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  Timer, 
  MessageCircle, 
  User, 
  Settings, 
  PieChart,
  UserCheck,
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
    if (onNavigate) {
      onNavigate(item.path);
    }
    if (onClose) {
      onClose();
    }
  };

  if (item.disabled) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: sidebarExpanded ? '12px' : '0',
        padding: sidebarExpanded ? '12px 20px' : '12px 15px',
        margin: sidebarExpanded ? '0 12px' : '0 8px',
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
          fontSize: '16px',
          minWidth: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {getIcon(item.icon)}
        </span>
        
        {sidebarExpanded && (
          <span style={{ 
            flex: 1,
            opacity: sidebarExpanded ? 1 : 0,
            transform: sidebarExpanded ? 'translateX(0)' : 'translateX(-10px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}>
            {item.label}
          </span>
        )}
        
        {item.badge && sidebarExpanded && (
          <span style={{
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 600,
            background: '#f3f4f6',
            color: '#666',
            borderRadius: '12px',
            opacity: sidebarExpanded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}>
            {typeof item.badge === 'function' ? item.badge() : item.badge}
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
        gap: sidebarExpanded ? '12px' : '0',
        padding: sidebarExpanded ? '12px 20px' : '12px 15px',
        margin: sidebarExpanded ? '0 12px' : '0 8px',
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
        justifyContent: sidebarExpanded ? 'flex-start' : 'center'
      })}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = '#f8f9fa'
          e.currentTarget.style.color = '#1a1a1a'
          if (sidebarExpanded) {
            e.currentTarget.style.transform = 'translateX(4px)'
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#666'
          e.currentTarget.style.transform = 'translateX(0)'
        }
      }}
    >
      <span style={{ 
        fontSize: '16px',
        minWidth: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {getIcon(item.icon)}
      </span>
      
      {sidebarExpanded && (
        <span style={{ 
          flex: 1,
          opacity: sidebarExpanded ? 1 : 0,
          transform: sidebarExpanded ? 'translateX(0)' : 'translateX(-10px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}>
          {item.label}
        </span>
      )}
      
      {item.badge && sidebarExpanded && (
        <span style={{
          padding: '2px 8px',
          fontSize: '11px',
          fontWeight: 600,
          background: isActive ? 'rgba(255, 255, 255, 0.2)' : '#e0f2fe',
          color: isActive ? '#ffffff' : '#0369a1',
          borderRadius: '12px',
          opacity: sidebarExpanded ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}>
          {typeof item.badge === 'function' ? item.badge() : item.badge}
        </span>
      )}
    </NavLink>
  );
}

// Professional icon mapping using lucide-react
function getIcon(iconName?: string): JSX.Element {
  const iconProps = {
    size: 18,
    strokeWidth: 2
  };

  const iconMap: Record<string, JSX.Element> = {
    // Dashboard
    'dashboard': <LayoutDashboard {...iconProps} />,
    '📊': <LayoutDashboard {...iconProps} />,
    
    // Projects & Work
    'projects': <FolderOpen {...iconProps} />,
    '📁': <FolderOpen {...iconProps} />,
    
    // Tasks
    'tasks': <CheckSquare {...iconProps} />,
    '✓': <CheckSquare {...iconProps} />,
    'approval': <ClipboardCheck {...iconProps} />,
    '✅': <ClipboardCheck {...iconProps} />,
    
    // Tickets
    'tickets': <Ticket {...iconProps} />,
    '🎫': <Ticket {...iconProps} />,
    
    // Time & Attendance
    'clock': <Clock {...iconProps} />,
    '⏰': <Clock {...iconProps} />,
    'calendar': <Calendar {...iconProps} />,
    '📅': <Calendar {...iconProps} />,
    'timer': <Timer {...iconProps} />,
    '⏱️': <Timer {...iconProps} />,
    
    // Leave & Requests
    'umbrella': <Umbrella {...iconProps} />,
    '🏖️': <Umbrella {...iconProps} />,
    'clipboard': <ClipboardList {...iconProps} />,
    '📋': <ClipboardList {...iconProps} />,
    'file-text': <FileText {...iconProps} />,
    '📝': <FileText {...iconProps} />,
    
    // Team & Users
    'users': <Users {...iconProps} />,
    '👥': <Users {...iconProps} />,
    'user': <User {...iconProps} />,
    '👤': <User {...iconProps} />,
    
    // Communication
    'message': <MessageCircle {...iconProps} />,
    '💬': <MessageCircle {...iconProps} />,
    
    // Admin & Settings
    'settings': <Settings {...iconProps} />,
    '⚙️': <Settings {...iconProps} />,
    
    // Reports & Analytics
    'reports': <BarChart3 {...iconProps} />,
    '📈': <TrendingUp {...iconProps} />,
    'analytics': <PieChart {...iconProps} />
  };

  return iconMap[iconName || ''] || <ClipboardList {...iconProps} />;
}