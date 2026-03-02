import { ProjectStatus } from '../types/enums';

/**
 * Project Status Workflow Utility
 * 
 * Implements industry-standard project lifecycle workflow:
 * PLANNING → ACTIVE → (ON_HOLD ↔ ACTIVE) → COMPLETED → ARCHIVED
 * 
 * Requirements: 27.1, 27.2, 27.3, 27.4, 27.5
 */

interface WorkflowTransitions {
  [key: string]: string[];
}

const transitions: WorkflowTransitions = {
  [ProjectStatus.PLANNING]: [ProjectStatus.ACTIVE],
  [ProjectStatus.ACTIVE]: [ProjectStatus.ON_HOLD, ProjectStatus.COMPLETED],
  [ProjectStatus.ON_HOLD]: [ProjectStatus.ACTIVE],
  [ProjectStatus.COMPLETED]: [ProjectStatus.ARCHIVED],
  [ProjectStatus.ARCHIVED]: [],
};

/**
 * Validates if a status transition is allowed
 * 
 * @param from - Current project status
 * @param to - Desired new status
 * @returns Object with isValid flag and error message if invalid
 */
export function validateStatusTransition(
  from: string,
  to: string
): { isValid: boolean; error?: string } {
  // No transition needed
  if (from === to) {
    return { isValid: true };
  }

  const allowed = transitions[from] || [];

  if (!allowed.includes(to)) {
    const allowedStr = allowed.length > 0 
      ? allowed.join(', ') 
      : 'none (terminal state)';

    return {
      isValid: false,
      error: `Invalid status transition: ${from} → ${to}. ` +
             `Allowed transitions from ${from}: ${allowedStr}. ` +
             `Follow the workflow: PLANNING → ACTIVE → (ON_HOLD ↔ ACTIVE) → COMPLETED → ARCHIVED`
    };
  }

  return { isValid: true };
}

/**
 * Gets all allowed transitions from a given status
 * 
 * @param from - Current project status
 * @returns Array of allowed next statuses
 */
export function getAllowedTransitions(from: string): string[] {
  return transitions[from] || [];
}

/**
 * Checks if a status is terminal (no further transitions allowed)
 * 
 * @param status - Project status to check
 * @returns True if status is terminal
 */
export function isTerminalStatus(status: string): boolean {
  return transitions[status]?.length === 0;
}

/**
 * Gets user-friendly workflow help text
 * 
 * @returns Workflow description for display in UI
 */
export function getWorkflowHelpText(): string {
  return 'Project Lifecycle Workflow: PLANNING → ACTIVE → (ON_HOLD ↔ ACTIVE) → COMPLETED → ARCHIVED';
}
