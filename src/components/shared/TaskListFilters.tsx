import { useState, useEffect } from 'react';
import { TaskType, TaskStatus, Priority } from '../../types/enums';

interface TaskListFiltersProps {
  onFilterChange: (filters: any) => void;
}

const TaskListFilters = ({ onFilterChange }: TaskListFiltersProps) => {
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    priority: '',
  });

  // Load filters from session storage
  useEffect(() => {
    const savedFilters = sessionStorage.getItem('taskFilters');
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      setFilters(parsed);
      onFilterChange(parsed);
    }
  }, []);

  // Save filters to session storage and notify parent
  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    sessionStorage.setItem('taskFilters', JSON.stringify(newFilters));
    onFilterChange(newFilters);
  };

  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
      <select
        value={filters.type}
        onChange={(e) => handleFilterChange('type', e.target.value)}
        style={selectStyle}
      >
        <option value="">All Types</option>
        <option value={TaskType.ASSIGNED}>Assigned Tasks</option>
        <option value={TaskType.SELF_WORK}>Self-Work Tasks</option>
      </select>

      <select
        value={filters.status}
        onChange={(e) => handleFilterChange('status', e.target.value)}
        style={selectStyle}
      >
        <option value="">All Statuses</option>
        <option value={TaskStatus.PROPOSED}>Pending Approval</option>
        <option value={TaskStatus.TODO}>To Do</option>
        <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
        <option value={TaskStatus.REVIEW}>In Review</option>
        <option value={TaskStatus.COMPLETED}>Completed</option>
        <option value={TaskStatus.REJECTED}>Rejected</option>
        <option value={TaskStatus.CANCELLED}>Cancelled</option>
      </select>

      <select
        value={filters.priority}
        onChange={(e) => handleFilterChange('priority', e.target.value)}
        style={selectStyle}
      >
        <option value="">All Priorities</option>
        <option value={Priority.LOW}>Low</option>
        <option value={Priority.MEDIUM}>Medium</option>
        <option value={Priority.HIGH}>High</option>
        <option value={Priority.URGENT}>Urgent</option>
      </select>
    </div>
  );
};

const selectStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  fontSize: '14px',
  cursor: 'pointer',
};

export default TaskListFilters;
