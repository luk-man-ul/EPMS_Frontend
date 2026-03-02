# Shared UI Components

This directory contains reusable UI components used across all workspaces (Admin, TeamLead, Employee) in the EPMS frontend.

## Components

### SearchBar

A debounced text input component with clear button functionality.

**Props:**
- `placeholder: string` - Placeholder text for the input
- `value: string` - Current search value
- `onChange: (value: string) => void` - Callback when search value changes (debounced)
- `onClear?: () => void` - Optional callback when clear button is clicked
- `debounceMs?: number` - Debounce delay in milliseconds (default: 300ms)

**Usage:**
```tsx
import { SearchBar } from '@/components/shared';

<SearchBar
  placeholder="Search projects..."
  value={searchTerm}
  onChange={setSearchTerm}
  debounceMs={300}
/>
```

### FilterComponent

A dropdown component for enum-based filtering with "All" option to clear filters.

**Props:**
- `label: string` - Label displayed above the dropdown
- `options: Array<{ value: string; label: string }>` - Filter options
- `value: string | null` - Currently selected filter value
- `onChange: (value: string | null) => void` - Callback when filter changes
- `allowClear?: boolean` - Whether to show "All" option (default: true)

**Usage:**
```tsx
import { FilterComponent } from '@/components/shared';

<FilterComponent
  label="Status"
  options={[
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' }
  ]}
  value={statusFilter}
  onChange={setStatusFilter}
/>
```

### ConfirmationModal

A modal dialog for confirming important or destructive actions.

**Props:**
- `isOpen: boolean` - Whether the modal is visible
- `title: string` - Modal title
- `message: string` - Modal message/description
- `confirmText?: string` - Text for confirm button (default: "Confirm")
- `cancelText?: string` - Text for cancel button (default: "Cancel")
- `onConfirm: () => void` - Callback when confirm is clicked
- `onCancel: () => void` - Callback when cancel is clicked or modal is dismissed
- `variant?: 'danger' | 'warning' | 'info'` - Visual variant (default: 'info')

**Features:**
- Keyboard support: Enter to confirm, Escape to cancel
- Focus trap within modal
- Backdrop click to dismiss
- Color-coded by variant

**Usage:**
```tsx
import { ConfirmationModal } from '@/components/shared';

<ConfirmationModal
  isOpen={showDeleteConfirm}
  title="Delete Ticket"
  message="Are you sure you want to delete this ticket? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
  onConfirm={handleDeleteConfirm}
  onCancel={() => setShowDeleteConfirm(false)}
/>
```

## Toast Notification System

A global toast notification system using React Context API.

### ToastProvider

Wrap your app with `ToastProvider` to enable toast notifications globally (already integrated in App.tsx).

### useToast Hook

Access toast functionality from any component.

**Methods:**
- `showToast(type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number)` - Show a toast notification
- `hideToast(id: string)` - Manually hide a specific toast

**Features:**
- Auto-dismiss after 3 seconds (configurable)
- Manual dismiss via close button
- Stacking support for multiple toasts
- Top-right corner positioning
- Color-coded by type

**Usage:**
```tsx
import { useToast } from '@/context';

const MyComponent = () => {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast('success', 'Task updated successfully');
  };

  const handleError = () => {
    showToast('error', 'Failed to update task: Invalid status transition');
  };

  return (
    // ... component JSX
  );
};
```

## Design Principles

All components follow these design principles:

1. **Consistency**: Uniform styling across all workspaces
2. **Accessibility**: Keyboard support and focus management
3. **Responsiveness**: Adapts to different screen sizes
4. **Type Safety**: Full TypeScript support with proper interfaces
5. **Minimal Dependencies**: Uses inline styles for simplicity and portability
