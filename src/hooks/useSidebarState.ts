import { useState } from 'react';

/**
 * Interface representing the sidebar state
 * Tracks which navigation groups are expanded/collapsed
 */
export interface SidebarState {
  expandedGroups: Record<string, boolean>;
}

/**
 * Custom hook for managing sidebar navigation group state
 * Persists expand/collapse state to localStorage
 * 
 * @returns Object containing state and toggleGroup function
 */
export function useSidebarState() {
  const [state, setState] = useState<SidebarState>(() => {
    const saved = localStorage.getItem('sidebar-state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to parse sidebar state from localStorage:', error);
        return { expandedGroups: {} };
      }
    }
    return { expandedGroups: {} };
  });

  /**
   * Toggle the expanded/collapsed state of a navigation group
   * @param groupId - The unique identifier of the navigation group
   */
  const toggleGroup = (groupId: string) => {
    setState((prev) => {
      const newState = {
        ...prev,
        expandedGroups: {
          ...prev.expandedGroups,
          [groupId]: !prev.expandedGroups[groupId],
        },
      };
      try {
        localStorage.setItem('sidebar-state', JSON.stringify(newState));
      } catch (error) {
        console.error('Failed to save sidebar state to localStorage:', error);
      }
      return newState;
    });
  };

  return { state, toggleGroup };
}
