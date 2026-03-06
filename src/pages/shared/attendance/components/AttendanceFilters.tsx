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

const AttendanceFilters = ({
  filters,
  onFilterChange,
  showUserFilter = false,
  users = [],
}: AttendanceFiltersProps) => {
  const handleChange = (field: string, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value || undefined,
    });
  };

  const statusOptions = getEnumOptions(AttendanceStatus);

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e5e5',
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showUserFilter ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'repeat(3, 1fr)',
          gap: '16px',
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#666666',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#666666',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#666666',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              background: '#ffffff',
            }}
          >
            <option value="">All Statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {showUserFilter && (
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#666666',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Employee
            </label>
            <select
              value={filters.userId || ''}
              onChange={(e) => handleChange('userId', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                background: '#ffffff',
              }}
            >
              <option value="">All Employees</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
        <button
          onClick={() =>
            onFilterChange({
              startDate: undefined,
              endDate: undefined,
              status: undefined,
              userId: undefined,
            })
          }
          style={{
            padding: '10px 20px',
            background: '#f3f4f6',
            color: '#1a1a1a',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
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
