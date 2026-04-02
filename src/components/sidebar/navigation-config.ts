/**
 * Navigation Configuration for EPMS Sidebar
 * 
 * This file defines the navigation structure for different user roles.
 * Each navigation group contains items that are filtered based on user permissions.
 */

import { 
  DASHBOARD_ROUTES,
  PROJECT_ROUTES,
  TASK_ROUTES,
  TICKET_ROUTES,
  ATTENDANCE_ROUTES,
  LEAVE_ROUTES,
  REPORTS_ROUTES,
  ADMIN_ROUTES,
  APP_DASHBOARD_ROUTES,
  APP_PROJECT_ROUTES,
  APP_TASK_ROUTES,
  APP_TICKET_ROUTES,
  APP_ATTENDANCE_ROUTES,
  APP_LEAVE_ROUTES,
  APP_REPORTS_ROUTES,
} from '../../routes/route-constants';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type UserRole = 'EMPLOYEE' | 'TEAM_LEAD' | 'ADMIN';

export interface NavigationItemConfig {
  id: string;
  label: string;
  path: string;
  icon?: string;
  badge?: number | string;
  roles: UserRole[];
  disabled?: boolean;
}

export interface NavigationGroupConfig {
  id: string;
  title: string;
  items: NavigationItemConfig[];
  roles: UserRole[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface NavigationConfig {
  groups: NavigationGroupConfig[];
}

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

export const navigationConfig: NavigationConfig = {
  groups: [
    // ========================================================================
    // MAIN NAVIGATION
    // ========================================================================
    {
      id: 'main',
      title: 'Main',
      collapsible: false,
      defaultExpanded: true,
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          path: APP_DASHBOARD_ROUTES.ROOT,
          icon: 'dashboard',
          roles: ['EMPLOYEE', 'TEAM_LEAD'],
        },
        {
          id: 'admin-dashboard',
          label: 'Dashboard',
          path: DASHBOARD_ROUTES.ROOT,
          icon: 'dashboard',
          roles: ['ADMIN'],
        },
      ],
    },

    // ========================================================================
    // WORK MANAGEMENT
    // ========================================================================
    {
      id: 'work',
      title: 'Work',
      collapsible: true,
      defaultExpanded: true,
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
      items: [
        {
          id: 'projects',
          label: 'Projects',
          path: APP_PROJECT_ROUTES.LIST,
          icon: 'projects',
          roles: ['EMPLOYEE', 'TEAM_LEAD'],
        },
        {
          id: 'admin-projects',
          label: 'Projects',
          path: PROJECT_ROUTES.LIST,
          icon: 'projects',
          roles: ['ADMIN'],
        },
        {
          id: 'my-tasks',
          label: 'My Tasks',
          path: APP_TASK_ROUTES.MY_TASKS,
          icon: 'tasks',
          roles: ['EMPLOYEE', 'TEAM_LEAD'],
        },
        {
          id: 'admin-tasks',
          label: 'Tasks',
          path: TASK_ROUTES.MY_TASKS,
          icon: 'tasks',
          roles: ['ADMIN'],
        },
        {
          id: 'tickets',
          label: 'Tickets',
          path: APP_TICKET_ROUTES.LIST,
          icon: 'tickets',
          roles: ['EMPLOYEE', 'TEAM_LEAD'],
        },
        {
          id: 'admin-tickets',
          label: 'Tickets',
          path: TICKET_ROUTES.LIST,
          icon: 'tickets',
          roles: ['ADMIN'],
        },
      ],
    },

    // ========================================================================
    // ATTENDANCE & LEAVE
    // ========================================================================
    {
      id: 'attendance-leave',
      title: 'Attendance & Leave',
      collapsible: true,
      defaultExpanded: true,
      roles: ['EMPLOYEE', 'TEAM_LEAD'],
      items: [
        {
          id: 'attendance-check-in',
          label: 'Check In/Out',
          path: APP_ATTENDANCE_ROUTES.CHECK_IN,
          icon: 'clock',
          roles: ['EMPLOYEE', 'TEAM_LEAD'],
        },
        {
          id: 'attendance-history',
          label: 'My Attendance',
          path: APP_ATTENDANCE_ROUTES.HISTORY,
          icon: 'calendar',
          roles: ['EMPLOYEE', 'TEAM_LEAD'],
        },
        {
          id: 'leave-request',
          label: 'Request Leave',
          path: APP_LEAVE_ROUTES.REQUEST,
          icon: 'umbrella',
          roles: ['EMPLOYEE', 'TEAM_LEAD'],
        },
        {
          id: 'leave-history',
          label: 'My Leave',
          path: APP_LEAVE_ROUTES.HISTORY,
          icon: 'clipboard',
          roles: ['EMPLOYEE', 'TEAM_LEAD'],
        },
        {
          id: 'wfh-request',
          label: 'Request WFH',
          path: '/app/wfh/request',
          icon: 'home',
          roles: ['EMPLOYEE', 'TEAM_LEAD'],
        },
        {
          id: 'wfh-history',
          label: 'My WFH',
          path: '/app/wfh',
          icon: 'laptop',
          roles: ['EMPLOYEE', 'TEAM_LEAD'],
        },
      ],
    },

    // ========================================================================
    // TEAM LEAD SECTION
    // ========================================================================
    {
      id: 'team-management',
      title: 'Team Management',
      collapsible: true,
      defaultExpanded: true,
      roles: ['TEAM_LEAD', 'ADMIN'],
      items: [
        {
          id: 'work-approval',
          label: 'Work Approval',
          path: APP_TASK_ROUTES.APPROVAL,
          icon: 'approval',
          roles: ['TEAM_LEAD'],
        },
        {
          id: 'admin-work-approval',
          label: 'Work Approval',
          path: TASK_ROUTES.APPROVAL,
          icon: 'approval',
          roles: ['ADMIN'],
        },
        {
          id: 'team-attendance',
          label: 'Team Attendance',
          path: APP_ATTENDANCE_ROUTES.TEAM,
          icon: 'users',
          roles: ['TEAM_LEAD'],
        },
        {
          id: 'leave-approvals',
          label: 'Leave Approvals',
          path: APP_LEAVE_ROUTES.APPROVALS,
          icon: 'file-text',
          roles: ['TEAM_LEAD'],
        },
        {
          id: 'wfh-approvals',
          label: 'WFH Requests',
          path: '/app/wfh/requests',
          icon: 'home',
          roles: ['TEAM_LEAD'],
        },
        {
          id: 'admin-leave-approvals',
          label: 'Leave Approvals',
          path: LEAVE_ROUTES.APPROVALS,
          icon: 'file-text',
          roles: ['ADMIN'],
        },
        {
          id: 'admin-wfh-approvals',
          label: 'WFH Requests',
          path: '/admin/wfh/requests',
          icon: 'home',
          roles: ['ADMIN'],
        },
        {
          id: 'reports',
          label: 'Reports',
          path: APP_REPORTS_ROUTES.ROOT,
          icon: 'reports',
          roles: ['TEAM_LEAD'],
        },
        {
          id: 'admin-reports',
          label: 'Reports',
          path: REPORTS_ROUTES.ROOT,
          icon: 'reports',
          roles: ['ADMIN'],
        },
      ],
    },

    // ========================================================================
    // COMMUNICATION
    // ========================================================================
    {
      id: 'communication',
      title: 'Communication',
      collapsible: true,
      defaultExpanded: false,
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
      items: [
        {
          id: 'chat',
          label: 'Chat',
          path: '/app/chat',
          icon: 'message',
          roles: ['EMPLOYEE', 'TEAM_LEAD'],
        },
        {
          id: 'admin-chat',
          label: 'Chat',
          path: '/admin/chat',
          icon: 'message',
          roles: ['ADMIN'],
        },
      ],
    },

    // ========================================================================
    // ADMIN SECTION
    // ========================================================================
    {
      id: 'administration',
      title: 'Administration',
      collapsible: true,
      defaultExpanded: true,
      roles: ['ADMIN'],
      items: [
        {
          id: 'employees',
          label: 'Employees',
          path: ADMIN_ROUTES.EMPLOYEES,
          icon: 'user',
          roles: ['ADMIN'],
        },
        {
          id: 'attendance-reports',
          label: 'Attendance Reports',
          path: ATTENDANCE_ROUTES.REPORTS,
          icon: 'analytics',
          roles: ['ADMIN'],
        },
        {
          id: 'settings',
          label: 'Settings',
          path: ADMIN_ROUTES.SETTINGS,
          icon: 'settings',
          roles: ['ADMIN'],
        },
      ],
    },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get navigation items for a specific role
 */
export function getNavigationForRole(role: UserRole): NavigationGroupConfig[] {
  return navigationConfig.groups
    .filter(group => group.roles.includes(role))
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.roles.includes(role)),
    }))
    .filter(group => group.items.length > 0);
}

/**
 * Find a navigation item by path
 */
export function findNavigationItemByPath(path: string): NavigationItemConfig | null {
  for (const group of navigationConfig.groups) {
    const item = group.items.find(item => item.path === path);
    if (item) {
      return item;
    }
  }
  return null;
}

/**
 * Check if a user role has access to a specific path
 */
export function hasAccessToPath(role: UserRole, path: string): boolean {
  const item = findNavigationItemByPath(path);
  return item ? item.roles.includes(role) : false;
}
