import { AttendanceStatus, getEnumOptions } from '../../../../types/enums';

interface AttendanceFiltersProps {
  filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
    userId?: string;
  };
  onFilterChange: (filters: any) => void;
  showUserFilter?: boolean;
  users?: Array<{ id: string; firstName: string; lastName: string }>;
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: '#6b7280',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '13px',
  fontFamily: 'inherit',
  color: '#111827',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

const AttendanceFilters = ({
  filters,
  onFilterChange,
  showUserFilter = false,
  users = [],
}: AttendanceFiltersProps) => {
  const handleChange = (field: string, value: string) => {
    onFilterChange({ ...filters, [field]: value || undefined });
  };

  const statusOptions = getEnumOptions(AttendanceStatus);
  const cols = showUserFilter ? 4 : 3;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      border: '1px solid #f3f4f6',
      padding: '20px 24px',
      marginBottom: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '16px',
        alignItems: 'end',
      }}>
        <div>
          <label style={labelStyle}>Start Date</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>End Date</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            style={inputStyle}
          >
            <option value="">All Statuses</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {showUserFilter && (
          <div>
            <label style={labelStyle}>Employee</label>
            <select
              value={filters.userId || ''}
              onChange={(e) => handleChange('userId', e.target.value)}
              style={inputStyle}
            >
              <option value="">All Employees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px' }}>
        <button
          onClick={() => onFilterChange({ startDate: undefined, endDate: undefined, status: undefined, userId: undefined })}
          style={{
            padding: '8px 18px',
            background: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#e5e7eb')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#f3f4f6')}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default AttendanceFilters;
