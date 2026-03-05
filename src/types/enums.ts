/**
 * Frontend Enum Types - Aligned with Backend Prisma Schema
 * 
 * CRITICAL: These enum values MUST match exactly with the Prisma schema enums.
 * Any mismatch will cause type errors and API validation failures.
 * 
 * Source: EMPS_Backend/prisma/schema.prisma
 * Last synced: 2026-03-01
 */

// ======================================================
// PROJECT ENUMS
// ======================================================

export const ProjectStatus = {
  PLANNING: 'PLANNING',
  ACTIVE: 'ACTIVE',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

// ======================================================
// TASK ENUMS
// ======================================================

export const TaskType = {
  ASSIGNED: 'ASSIGNED',
  SELF_WORK: 'SELF_WORK',
} as const;

export type TaskType = typeof TaskType[keyof typeof TaskType];

export const TaskStatus = {
  PROPOSED: 'PROPOSED',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type Priority = typeof Priority[keyof typeof Priority];

// ======================================================
// TICKET ENUMS
// ======================================================

export const TicketStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_FOR_USER: 'WAITING_FOR_USER',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED',
  REOPENED: 'REOPENED',
} as const;

export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];

export const TicketType = {
  BUG: 'BUG',
  FEATURE: 'FEATURE',
  SUPPORT: 'SUPPORT',
  IMPROVEMENT: 'IMPROVEMENT',
} as const;

export type TicketType = typeof TicketType[keyof typeof TicketType];

// ======================================================
// USER ENUMS
// ======================================================

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

// ======================================================
// ADDITIONAL ENUMS (for future use)
// ======================================================

export const AttendanceStatus = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  HALF_DAY: 'HALF_DAY',
  LEAVE: 'LEAVE',
  WFH: 'WFH',
} as const;

export type AttendanceStatus = typeof AttendanceStatus[keyof typeof AttendanceStatus];

export const LeaveType = {
  SICK: 'SICK',
  CASUAL: 'CASUAL',
  VACATION: 'VACATION',
  UNPAID: 'UNPAID',
} as const;

export type LeaveType = typeof LeaveType[keyof typeof LeaveType];

export const ApprovalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ApprovalStatus = typeof ApprovalStatus[keyof typeof ApprovalStatus];

export const ChannelType = {
  COMPANY: 'COMPANY',
  PROJECT: 'PROJECT',
} as const;

export type ChannelType = typeof ChannelType[keyof typeof ChannelType];

// ======================================================
// UTILITY FUNCTIONS
// ======================================================

/**
 * Converts enum values to human-readable display labels
 * 
 * Examples:
 * - "IN_PROGRESS" -> "In Progress"
 * - "WAITING_FOR_USER" -> "Waiting For User"
 * - "TODO" -> "To Do"
 * - "WFH" -> "WFH"
 * 
 * @param enumValue - The enum value to format (e.g., "IN_PROGRESS")
 * @returns Formatted display label (e.g., "In Progress")
 */
export function formatEnumLabel(enumValue: string): string {
  if (!enumValue) return '';
  
  // Special cases for better readability
  const specialCases: Record<string, string> = {
    'TODO': 'To Do',
    'WFH': 'WFH',
    'ON_HOLD': 'On Hold',
    'SELF_WORK': 'Self-Work',
  };
  
  if (specialCases[enumValue]) {
    return specialCases[enumValue];
  }
  
  // General case: split by underscore, capitalize each word
  return enumValue
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Gets all enum values as an array
 * 
 * @param enumObject - The enum object (e.g., TaskStatus)
 * @returns Array of enum values
 */
export function getEnumValues<T extends Record<string, string>>(enumObject: T): string[] {
  return Object.values(enumObject);
}

/**
 * Gets enum values formatted as options for dropdowns/filters
 * 
 * @param enumObject - The enum object (e.g., TaskStatus)
 * @returns Array of { value, label } objects
 */
export function getEnumOptions<T extends Record<string, string>>(
  enumObject: T
): Array<{ value: string; label: string }> {
  return Object.values(enumObject).map(value => ({
    value,
    label: formatEnumLabel(value),
  }));
}

/**
 * Validates if a value is a valid enum member
 * 
 * @param enumObject - The enum object to validate against
 * @param value - The value to validate
 * @returns True if value is a valid enum member
 */
export function isValidEnumValue<T extends Record<string, string>>(
  enumObject: T,
  value: string
): boolean {
  return Object.values(enumObject).includes(value);
}
