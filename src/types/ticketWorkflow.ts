/**
 * Ticket Status Workflow Configuration
 * 
 * This file centralizes ticket status transition rules to ensure
 * consistency between frontend UI and backend validation.
 * 
 * IMPORTANT: Keep this synchronized with backend:
 * EMPS_Backend/src/tickets/ticket-workflow.service.ts
 */

export type TicketStatus = 
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_USER'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'REOPENED'

export type UserRole = 'ADMIN' | 'TEAM_LEAD' | 'EMPLOYEE'

/**
 * Defines valid status transitions
 * Maps current status to array of allowed next statuses
 */
export const STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['WAITING_FOR_USER', 'RESOLVED'],
  WAITING_FOR_USER: ['IN_PROGRESS', 'RESOLVED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  CLOSED: [],
  REJECTED: [],
  REOPENED: ['IN_PROGRESS'],
}

/**
 * Transitions that require TEAM_LEAD or ADMIN role
 * Format: "FROM_STATUS->TO_STATUS"
 */
export const PRIVILEGED_TRANSITIONS = new Set([
  'RESOLVED->CLOSED',
  'CLOSED->REOPENED',
])

/**
 * Transitions that require user to be the assignee
 * Format: "FROM_STATUS->TO_STATUS"
 */
export const ASSIGNEE_ONLY_TRANSITIONS = new Set([
  'OPEN->IN_PROGRESS',
  'IN_PROGRESS->WAITING_FOR_USER',
  'IN_PROGRESS->RESOLVED',
  'WAITING_FOR_USER->IN_PROGRESS',
  'WAITING_FOR_USER->RESOLVED',
  'REOPENED->IN_PROGRESS',
])

/**
 * Get allowed status transitions for a user
 * 
 * @param currentStatus - Current ticket status
 * @param userRole - User's role (ADMIN, TEAM_LEAD, EMPLOYEE)
 * @param isPrivileged - Whether user has privileged access (e.g., is project lead)
 * @returns Array of allowed status transitions
 */
export function getAllowedTransitions(
  currentStatus: TicketStatus,
  userRole: UserRole,
  isPrivileged: boolean = false
): TicketStatus[] {
  // ADMIN can transition to any status
  if (userRole === 'ADMIN') {
    return [
      'OPEN',
      'IN_PROGRESS',
      'WAITING_FOR_USER',
      'RESOLVED',
      'CLOSED',
      'REJECTED',
      'REOPENED',
    ]
  }

  // Get base transitions for current status
  const baseTransitions = STATUS_TRANSITIONS[currentStatus] || []
  
  // Always include current status (no-op transition)
  const allowedStatuses = [currentStatus, ...baseTransitions]

  // Filter out privileged transitions for non-privileged users
  if (userRole === 'TEAM_LEAD' && !isPrivileged) {
    return allowedStatuses.filter(status => {
      const transitionKey = `${currentStatus}->${status}`
      return !PRIVILEGED_TRANSITIONS.has(transitionKey)
    })
  }

  return allowedStatuses
}

/**
 * Check if a transition requires privileged role
 * 
 * @param fromStatus - Current status
 * @param toStatus - Target status
 * @returns true if transition requires TEAM_LEAD or ADMIN
 */
export function requiresPrivilegedRole(
  fromStatus: TicketStatus,
  toStatus: TicketStatus
): boolean {
  const transitionKey = `${fromStatus}->${toStatus}`
  return PRIVILEGED_TRANSITIONS.has(transitionKey)
}

/**
 * Check if a transition requires user to be assignee
 * 
 * @param fromStatus - Current status
 * @param toStatus - Target status
 * @returns true if transition requires user to be assignee
 */
export function requiresAssignee(
  fromStatus: TicketStatus,
  toStatus: TicketStatus
): boolean {
  const transitionKey = `${fromStatus}->${toStatus}`
  return ASSIGNEE_ONLY_TRANSITIONS.has(transitionKey)
}

/**
 * Format status for display
 * Converts "IN_PROGRESS" to "In Progress"
 */
export function formatStatus(status: TicketStatus): string {
  return status
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}
