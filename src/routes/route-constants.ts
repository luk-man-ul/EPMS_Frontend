/**
 * Route Constants for EPMS
 * 
 * This file defines all route patterns following RESTful structure and provides
 * mapping from old routes to new routes for backward compatibility.
 * 
 * Route Structure Principles:
 * 1. Module-based organization: /{module}/{action}
 * 2. Resource-based for entities: /{module}/{id}/{action}
 * 3. Role-based access via guards, not URL structure
 * 4. Consistent naming conventions
 * 
 * IMPORTANT: Routes are prefixed with /admin/ or /app/ based on user role
 */

// ============================================================================
// ADMIN ROUTES (for ADMIN role)
// ============================================================================

/**
 * Dashboard Routes - Admin
 */
export const DASHBOARD_ROUTES = {
  ROOT: '/admin/dashboard',
} as const;

/**
 * Project Routes - Admin
 */
export const PROJECT_ROUTES = {
  LIST: '/admin/projects',
  DETAIL: '/admin/projects/:id',
  EDIT: '/admin/projects/:id/edit',
  CREATE: '/admin/projects/create',
} as const;

/**
 * Task Routes - Admin
 */
export const TASK_ROUTES = {
  MY_TASKS: '/admin/tasks',
  TEAM_TASKS: '/admin/tasks/team',
  APPROVAL: '/admin/tasks/approval',
  DETAIL: '/admin/tasks/:id',
  CREATE: '/admin/tasks/create',
  EDIT: '/admin/tasks/:id/edit',
} as const;

/**
 * Ticket Routes - Admin
 */
export const TICKET_ROUTES = {
  LIST: '/admin/tickets',
  DETAIL: '/admin/tickets/:id',
  CREATE: '/admin/tickets/create',
  EDIT: '/admin/tickets/:id/edit',
} as const;

/**
 * Attendance Routes - Admin
 */
export const ATTENDANCE_ROUTES = {
  ROOT: '/admin/attendance',
  CHECK_IN: '/admin/attendance/check-in',
  HISTORY: '/admin/attendance/history',
  TEAM: '/admin/attendance/team',
  REPORTS: '/admin/attendance/reports',
} as const;

/**
 * Leave Routes - Admin
 */
export const LEAVE_ROUTES = {
  ROOT: '/admin/leave',
  REQUEST: '/admin/leave/request',
  HISTORY: '/admin/leave/history',
  APPROVALS: '/admin/leave/approvals',
} as const;

/**
 * Time Tracking Routes - Admin
 */
export const TIME_TRACKING_ROUTES = {
  ROOT: '/admin/time-tracking',
} as const;

/**
 * Reports Routes - Admin
 */
export const REPORTS_ROUTES = {
  ROOT: '/admin/reports',
} as const;

/**
 * Admin Routes
 */
export const ADMIN_ROUTES = {
  EMPLOYEES: '/admin/employees',
  EMPLOYEE_DETAIL: '/admin/employees/:id',
  SETTINGS: '/admin/settings',
} as const;

// ============================================================================
// APP ROUTES (for EMPLOYEE and TEAM_LEAD roles)
// ============================================================================

/**
 * Dashboard Routes - App
 */
export const APP_DASHBOARD_ROUTES = {
  ROOT: '/app/dashboard',
} as const;

/**
 * Project Routes - App
 */
export const APP_PROJECT_ROUTES = {
  LIST: '/app/projects',
  DETAIL: '/app/projects/:id',
  EDIT: '/app/projects/:id/edit',
  CREATE: '/app/projects/create',
} as const;

/**
 * Task Routes - App
 */
export const APP_TASK_ROUTES = {
  MY_TASKS: '/app/tasks',
  TEAM_TASKS: '/app/tasks/team',
  APPROVAL: '/app/tasks/approval',
  DETAIL: '/app/tasks/:id',
  CREATE: '/app/tasks/create',
  EDIT: '/app/tasks/:id/edit',
} as const;

/**
 * Ticket Routes - App
 */
export const APP_TICKET_ROUTES = {
  LIST: '/app/tickets',
  DETAIL: '/app/tickets/:id',
  CREATE: '/app/tickets/create',
  EDIT: '/app/tickets/:id/edit',
} as const;

/**
 * Attendance Routes - App
 */
export const APP_ATTENDANCE_ROUTES = {
  ROOT: '/app/attendance',
  CHECK_IN: '/app/attendance/check-in',
  HISTORY: '/app/attendance/history',
  TEAM: '/app/attendance/team',
  REPORTS: '/app/attendance/reports',
} as const;

/**
 * Leave Routes - App
 */
export const APP_LEAVE_ROUTES = {
  ROOT: '/app/leave',
  REQUEST: '/app/leave/request',
  HISTORY: '/app/leave/history',
  APPROVALS: '/app/leave/approvals',
} as const;

/**
 * Time Tracking Routes - App
 */
export const APP_TIME_TRACKING_ROUTES = {
  ROOT: '/app/time-tracking',
} as const;

/**
 * Reports Routes - App
 */
export const APP_REPORTS_ROUTES = {
  ROOT: '/app/reports',
} as const;

// ============================================================================
// OLD TO NEW ROUTE MAPPING
// ============================================================================

/**
 * Route redirects from old patterns to new patterns
 * Used for backward compatibility and migration
 */
export const ROUTE_REDIRECTS: Record<string, string> = {
  // ===== Employee Routes =====
  '/Employee/attendance': ATTENDANCE_ROUTES.HISTORY,
  '/Employee/leave': LEAVE_ROUTES.HISTORY,
  '/Employee/tasks': TASK_ROUTES.MY_TASKS,
  '/Employee/dashboard': DASHBOARD_ROUTES.ROOT,

  // ===== Shared Routes - Attendance =====
  '/shared/attendance/my-attendance': ATTENDANCE_ROUTES.HISTORY,
  '/shared/attendance/check-in': ATTENDANCE_ROUTES.CHECK_IN,
  '/attendance/my': ATTENDANCE_ROUTES.HISTORY, // Current route in AppWorkspaceRoutes

  // ===== Shared Routes - Leave =====
  '/shared/leave/my-leave': LEAVE_ROUTES.HISTORY,
  '/shared/leave/request': LEAVE_ROUTES.REQUEST,
  '/leave/my': LEAVE_ROUTES.HISTORY, // Current route in AppWorkspaceRoutes

  // ===== Team Lead Routes - Attendance =====
  '/TeamLead/attendance/team': ATTENDANCE_ROUTES.TEAM,
  '/team/attendance': ATTENDANCE_ROUTES.TEAM, // Current route in AppWorkspaceRoutes

  // ===== Team Lead Routes - Leave =====
  '/TeamLead/leave/approvals': LEAVE_ROUTES.APPROVALS,
  '/team/leave-approvals': LEAVE_ROUTES.APPROVALS, // Current route in AppWorkspaceRoutes

  // ===== Team Lead Routes - Work Approval =====
  '/TeamLead/workApproval': TASK_ROUTES.APPROVAL,
  '/work-approval': TASK_ROUTES.APPROVAL, // Current route in AppWorkspaceRoutes

  // ===== Admin Routes - Attendance =====
  '/admin/attendance/dashboard': ATTENDANCE_ROUTES.REPORTS,
  '/admin/attendance-dashboard': ATTENDANCE_ROUTES.REPORTS, // Current route in AdminRoutes

  // ===== Admin Routes - Leave =====
  '/admin/leave/management': LEAVE_ROUTES.APPROVALS,
  '/admin/leave-approvals': LEAVE_ROUTES.APPROVALS, // Current route in AdminRoutes
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a route path with parameters
 * @param route - Route pattern with :param placeholders
 * @param params - Object with parameter values
 * @returns Formatted route path
 * 
 * @example
 * generatePath(PROJECT_ROUTES.DETAIL, { id: '123' }) // '/projects/123'
 */
export function generatePath(route: string, params: Record<string, string | number>): string {
  let path = route;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, String(value));
  });
  return path;
}

/**
 * Check if a route requires specific role access
 * @param route - Route path to check
 * @returns Array of roles that can access the route
 */
export function getRouteRoles(route: string): string[] {
  // Admin-only routes
  if (route.startsWith('/admin/')) {
    return ['ADMIN'];
  }

  // Team Lead and Admin routes
  if (
    route === ATTENDANCE_ROUTES.TEAM ||
    route === ATTENDANCE_ROUTES.REPORTS ||
    route === LEAVE_ROUTES.APPROVALS ||
    route === TASK_ROUTES.APPROVAL ||
    route === REPORTS_ROUTES.ROOT
  ) {
    return ['TEAM_LEAD', 'ADMIN'];
  }

  // All authenticated users
  return ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'];
}

/**
 * Get the new route for an old route pattern
 * @param oldRoute - Old route path
 * @returns New route path or null if no mapping exists
 */
export function getRedirectRoute(oldRoute: string): string | null {
  return ROUTE_REDIRECTS[oldRoute] || null;
}

// ============================================================================
// ROUTE DOCUMENTATION
// ============================================================================

/**
 * Complete route structure documentation
 */
export const ROUTE_DOCUMENTATION = {
  dashboard: {
    path: DASHBOARD_ROUTES.ROOT,
    description: 'Main dashboard (role-aware)',
    roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
  },
  projects: {
    list: {
      path: PROJECT_ROUTES.LIST,
      description: 'Project list',
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
    },
    detail: {
      path: PROJECT_ROUTES.DETAIL,
      description: 'Project detail view',
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
    },
    edit: {
      path: PROJECT_ROUTES.EDIT,
      description: 'Edit project',
      roles: ['TEAM_LEAD', 'ADMIN'],
    },
    create: {
      path: PROJECT_ROUTES.CREATE,
      description: 'Create new project',
      roles: ['TEAM_LEAD', 'ADMIN'],
    },
  },
  tasks: {
    myTasks: {
      path: TASK_ROUTES.MY_TASKS,
      description: 'Personal tasks view',
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
    },
    teamTasks: {
      path: TASK_ROUTES.TEAM_TASKS,
      description: 'Team tasks view',
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
    },
    approval: {
      path: TASK_ROUTES.APPROVAL,
      description: 'Work approval queue',
      roles: ['TEAM_LEAD', 'ADMIN'],
    },
    detail: {
      path: TASK_ROUTES.DETAIL,
      description: 'Task detail view',
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
    },
  },
  tickets: {
    list: {
      path: TICKET_ROUTES.LIST,
      description: 'Ticket center',
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
    },
    detail: {
      path: TICKET_ROUTES.DETAIL,
      description: 'Ticket detail view',
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
    },
  },
  attendance: {
    root: {
      path: ATTENDANCE_ROUTES.ROOT,
      description: 'Main attendance view (role-aware)',
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
    },
    checkIn: {
      path: ATTENDANCE_ROUTES.CHECK_IN,
      description: 'Check in/out interface',
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
    },
    history: {
      path: ATTENDANCE_ROUTES.HISTORY,
      description: 'Personal attendance history',
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
    },
    team: {
      path: ATTENDANCE_ROUTES.TEAM,
      description: 'Team attendance view',
      roles: ['TEAM_LEAD', 'ADMIN'],
    },
    reports: {
      path: ATTENDANCE_ROUTES.REPORTS,
      description: 'Attendance analytics dashboard',
      roles: ['ADMIN'],
    },
  },
  leave: {
    root: {
      path: LEAVE_ROUTES.ROOT,
      description: 'Main leave view (role-aware)',
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
    },
    request: {
      path: LEAVE_ROUTES.REQUEST,
      description: 'Leave request form',
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
    },
    history: {
      path: LEAVE_ROUTES.HISTORY,
      description: 'Personal leave history',
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
    },
    approvals: {
      path: LEAVE_ROUTES.APPROVALS,
      description: 'Leave approval queue',
      roles: ['TEAM_LEAD', 'ADMIN'],
    },
  },
  timeTracking: {
    root: {
      path: TIME_TRACKING_ROUTES.ROOT,
      description: 'Time logs',
      roles: ['EMPLOYEE', 'TEAM_LEAD', 'ADMIN'],
    },
  },
  reports: {
    root: {
      path: REPORTS_ROUTES.ROOT,
      description: 'Reports dashboard',
      roles: ['TEAM_LEAD', 'ADMIN'],
    },
  },
  admin: {
    employees: {
      path: ADMIN_ROUTES.EMPLOYEES,
      description: 'Employee management',
      roles: ['ADMIN'],
    },
    employeeDetail: {
      path: ADMIN_ROUTES.EMPLOYEE_DETAIL,
      description: 'Employee detail view',
      roles: ['ADMIN'],
    },
    settings: {
      path: ADMIN_ROUTES.SETTINGS,
      description: 'System settings',
      roles: ['ADMIN'],
    },
  },
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * All route constants in a single object for convenience
 */
export const ROUTES = {
  DASHBOARD: DASHBOARD_ROUTES,
  PROJECTS: PROJECT_ROUTES,
  TASKS: TASK_ROUTES,
  TICKETS: TICKET_ROUTES,
  ATTENDANCE: ATTENDANCE_ROUTES,
  LEAVE: LEAVE_ROUTES,
  TIME_TRACKING: TIME_TRACKING_ROUTES,
  REPORTS: REPORTS_ROUTES,
  ADMIN: ADMIN_ROUTES,
} as const;

export default ROUTES;
