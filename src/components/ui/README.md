# UI Component Library

A comprehensive collection of reusable UI components built with React, TypeScript, and Tailwind CSS for the EPMS application.

## Installation

All components are available through a single barrel export:

```typescript
import { Button, Input, Modal, Table } from '@/components/ui';
```

## Components

### Button

A versatile button component with multiple variants, sizes, and states.

**Props:**
- `variant?: 'primary' | 'secondary' | 'danger' | 'ghost'` - Visual style (default: 'primary')
- `size?: 'sm' | 'md' | 'lg'` - Button size (default: 'md')
- `loading?: boolean` - Shows loading spinner (default: false)
- `icon?: React.ReactNode` - Icon to display before text
- `fullWidth?: boolean` - Makes button full width (default: false)
- `disabled?: boolean` - Disables the button
- `children: React.ReactNode` - Button content

**Usage:**
```tsx
import { Button } from '@/components/ui';

// Primary button
<Button onClick={handleClick}>Submit</Button>

// Loading state
<Button loading variant="primary">Saving...</Button>

// With icon
<Button icon={<PlusIcon />} variant="secondary">Add Item</Button>

// Danger button
<Button variant="danger" size="sm">Delete</Button>
```

---

### Input

A flexible input component supporting multiple input types with validation states.

**Props:**
- `type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local' | 'textarea'` - Input type (default: 'text')
- `label?: string` - Label text
- `error?: string` - Error message to display
- `helperText?: string` - Helper text below input
- `required?: boolean` - Shows required indicator
- `disabled?: boolean` - Disables the input
- `placeholder?: string` - Placeholder text
- `value?: string | number` - Input value
- `onChange?: (value: string) => void` - Change handler
- `rows?: number` - Number of rows for textarea (default: 3)

**Usage:**
```tsx
import { Input } from '@/components/ui';

// Basic text input
<Input
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  required
/>

// With error
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
/>

// Textarea
<Input
  label="Description"
  type="textarea"
  rows={5}
  helperText="Provide a detailed description"
/>
```

---

### Select

A select dropdown component with single and multi-select support.

**Props:**
- `options: SelectOption[]` - Array of options
- `value?: string | number | (string | number)[]` - Selected value(s)
- `onChange?: (value: string | number | (string | number)[]) => void` - Change handler
- `label?: string` - Label text
- `error?: string` - Error message
- `placeholder?: string` - Placeholder text (default: 'Select an option')
- `multiple?: boolean` - Enable multi-select (default: false)
- `disabled?: boolean` - Disable the select
- `required?: boolean` - Show required indicator

**SelectOption Interface:**
```typescript
interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
```

**Usage:**
```tsx
import { Select } from '@/components/ui';

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3', disabled: true },
];

// Single select
<Select
  label="Choose an option"
  options={options}
  value={selected}
  onChange={setSelected}
/>

// Multi-select
<Select
  label="Select multiple"
  options={options}
  multiple
  value={selectedItems}
  onChange={setSelectedItems}
/>
```

---

### Modal

A modal dialog component with customizable sections and sizes.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Close handler
- `title?: string` - Modal title
- `children: React.ReactNode` - Modal content
- `footer?: React.ReactNode` - Footer content
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Modal size (default: 'md')
- `closeOnOverlayClick?: boolean` - Close when clicking overlay (default: true)

**Usage:**
```tsx
import { Modal, Button } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

---

### Table

A data table component with sorting, loading states, and row interactions.

**Props:**
- `columns: Column<T>[]` - Column definitions
- `data: T[]` - Table data
- `keyExtractor: (row: T) => string | number` - Unique key for each row
- `loading?: boolean` - Show loading skeleton
- `emptyMessage?: string` - Message when no data (default: 'No data available')
- `onRowClick?: (row: T) => void` - Row click handler
- `sortBy?: string` - Current sort column
- `sortDirection?: 'asc' | 'desc'` - Sort direction
- `onSort?: (key: string) => void` - Sort handler

**Column Interface:**
```typescript
interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}
```

**Usage:**
```tsx
import { Table } from '@/components/ui';

interface User {
  id: number;
  name: string;
  email: string;
  status: string;
}

const columns: Column<User>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', sortable: true },
  {
    key: 'status',
    header: 'Status',
    render: (user) => <Badge variant={user.status === 'active' ? 'success' : 'default'}>{user.status}</Badge>
  },
];

<Table
  columns={columns}
  data={users}
  keyExtractor={(user) => user.id}
  loading={isLoading}
  onRowClick={(user) => navigate(`/users/${user.id}`)}
  sortBy={sortColumn}
  sortDirection={sortDirection}
  onSort={handleSort}
/>
```

---

### Card

A container component with optional header and footer sections.

**Props:**
- `children: React.ReactNode` - Card content
- `header?: React.ReactNode` - Header content
- `footer?: React.ReactNode` - Footer content
- `className?: string` - Additional CSS classes
- `padding?: 'none' | 'sm' | 'md' | 'lg'` - Content padding (default: 'md')

**Usage:**
```tsx
import { Card, Button } from '@/components/ui';

<Card
  header={<h2 className="text-lg font-semibold">User Profile</h2>}
  footer={
    <Button variant="primary">Save Changes</Button>
  }
  padding="lg"
>
  <p>Card content goes here...</p>
</Card>
```

---

### Badge

A badge component for displaying status indicators and labels.

**Props:**
- `children: React.ReactNode` - Badge content
- `variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'` - Visual style (default: 'default')
- `size?: 'sm' | 'md' | 'lg'` - Badge size (default: 'md')
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Active</Badge>
<Badge variant="warning" size="sm">Pending</Badge>
<Badge variant="danger">Rejected</Badge>
<Badge variant="info">New</Badge>
```

---

### Loading Components

#### LoadingSpinner

A spinning loader for indicating loading states.

**Props:**
- `size?: 'sm' | 'md' | 'lg'` - Spinner size (default: 'md')
- `className?: string` - Additional CSS classes
- `text?: string` - Optional loading text

**Usage:**
```tsx
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner size="lg" text="Loading data..." />
```

#### Skeleton

A skeleton loader for placeholder content.

**Props:**
- `width?: string` - Width (default: '100%')
- `height?: string` - Height (default: '1rem')
- `className?: string` - Additional CSS classes
- `circle?: boolean` - Circular skeleton (default: false)

**Usage:**
```tsx
import { Skeleton } from '@/components/ui';

<Skeleton width="200px" height="20px" />
<Skeleton circle width="40px" height="40px" />
```

#### TableSkeleton

A skeleton loader specifically for tables.

**Props:**
- `rows?: number` - Number of skeleton rows (default: 5)
- `columns?: number` - Number of skeleton columns (default: 4)
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import { TableSkeleton } from '@/components/ui';

<TableSkeleton rows={10} columns={5} />
```

---

### ErrorMessage

An error message component with different display types.

**Props:**
- `message: string` - Error message text
- `type?: 'field' | 'form' | 'page'` - Display type (default: 'field')
- `onDismiss?: () => void` - Dismiss handler
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import { ErrorMessage } from '@/components/ui';

// Field-level error
<ErrorMessage message="This field is required" type="field" />

// Form-level error
<ErrorMessage
  message="Please fix the errors below"
  type="form"
  onDismiss={() => setError(null)}
/>

// Page-level error
<ErrorMessage
  message="Failed to load data. Please try again."
  type="page"
  onDismiss={() => setError(null)}
/>
```

---

### Toast

A toast notification component for temporary messages.

**Props:**
- `message: string` - Notification message
- `type?: 'success' | 'error' | 'info' | 'warning'` - Notification type (default: 'info')
- `duration?: number` - Auto-dismiss duration in ms (default: 5000, 0 to disable)
- `onClose: () => void` - Close handler
- `isVisible: boolean` - Controls visibility

**Usage:**
```tsx
import { Toast } from '@/components/ui';

<Toast
  message="Changes saved successfully!"
  type="success"
  isVisible={showToast}
  onClose={() => setShowToast(false)}
  duration={3000}
/>
```

---

## Component Development Guide

### Creating New Components

1. **Create component directory**: `src/components/ui/ComponentName/`
2. **Create component file**: `ComponentName.tsx`
3. **Define TypeScript interfaces**: Export props interface
4. **Implement component**: Use Tailwind CSS for styling
5. **Create barrel export**: `index.ts` in component directory
6. **Update main index**: Add exports to `src/components/ui/index.ts`
7. **Document component**: Add usage examples to this README

### Styling Guidelines

- Use Tailwind CSS utility classes for all styling
- Use CSS modules only for complex animations or effects
- Follow consistent spacing: `px-4 py-2` for padding, `mb-4` for margins
- Use semantic color classes: `text-gray-700`, `bg-blue-600`
- Ensure responsive design with Tailwind breakpoints

### TypeScript Best Practices

- Always define explicit prop interfaces
- Use proper types, never `any`
- Export all types and interfaces
- Use union types for variants: `'primary' | 'secondary'`
- Provide default values for optional props

### Accessibility

- Use semantic HTML elements
- Include ARIA labels for interactive elements
- Ensure keyboard navigation support
- Provide proper focus states
- Use sufficient color contrast

### Testing

- Write unit tests for all components
- Test all variants and states
- Test user interactions (clicks, inputs)
- Test accessibility features
- Use React Testing Library

---

## Examples

### Form Example

```tsx
import { Input, Select, Button, ErrorMessage } from '@/components/ui';

function UserForm() {
  const [formData, setFormData] = useState({ name: '', email: '', role: '' });
  const [errors, setErrors] = useState({});

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={formData.name}
        onChange={(value) => setFormData({ ...formData, name: value })}
        error={errors.name}
        required
      />
      
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => setFormData({ ...formData, email: value })}
        error={errors.email}
        required
      />
      
      <Select
        label="Role"
        options={roleOptions}
        value={formData.role}
        onChange={(value) => setFormData({ ...formData, role: value })}
        error={errors.role}
        required
      />
      
      {errors.form && <ErrorMessage message={errors.form} type="form" />}
      
      <Button type="submit" loading={isSubmitting}>
        Save User
      </Button>
    </form>
  );
}
```

### Data Table Example

```tsx
import { Table, Badge, Button, Card } from '@/components/ui';

function UserList() {
  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <Badge variant={user.status === 'active' ? 'success' : 'default'}>
          {user.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <Button size="sm" variant="ghost" onClick={() => handleEdit(user)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Card header={<h2>Users</h2>}>
      <Table
        columns={columns}
        data={users}
        keyExtractor={(user) => user.id}
        loading={isLoading}
        onSort={handleSort}
        sortBy={sortColumn}
        sortDirection={sortDirection}
      />
    </Card>
  );
}
```

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- React 18+
- TypeScript 4.9+
- Tailwind CSS 3+

## License

Internal use only - EPMS Project
