import { useState, useEffect } from 'react';
import { AttendanceStatus, getEnumOptions } from '../../../../types/enums';
import { todayLocalDateStr, daysAgoLocalDateStr } from '../../../../utils/date.util';

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

type QuickPreset = 'today' | '7days' | 'month' | null;

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

// Returns the first day of the current month as YYYY-MM-DD in local time
function startOfMonthLocalDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

const AttendanceFilters = ({
  filters,
  onFilterChange,
  showUserFilter = false,
  users = [],
}: AttendanceFiltersProps) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tracks which quick-select preset is active.
  // Set to null whenever the user manually edits a date input.
  const [activePreset, setActivePreset] = useState<QuickPreset>(null);

  const today      = todayLocalDateStr();
  const last7Start = daysAgoLocalDateStr(6); // 6 days ago + today = 7 days
  const monthStart = startOfMonthLocalDateStr();

  // Manual input change — clear the active preset so buttons de-highlight
  const handleChange = (field: string, value: string) => {
    setActivePreset(null);
    onFilterChange({ ...filters, [field]: value || undefined });
  };

  // Quick-select — set preset and update date range, preserve status/userId
  const applyQuickRange = (preset: QuickPreset, startDate: string, endDate: string) => {
    setActivePreset(preset);
    onFilterChange({ ...filters, startDate, endDate });
  };

  const quickBtnStyle = (preset: QuickPreset): React.CSSProperties => {
    const active = activePreset === preset;
    return {
      padding: isMobile ? '6px 14px' : '5px 14px',
      borderRadius: '6px',
      border: active ? '1.5px solid #6366f1' : '1px solid #e5e7eb',
      background: active ? '#eef2ff' : '#fff',
      color: active ? '#4f46e5' : '#374151',
      fontSize: '12px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.15s',
      whiteSpace: 'nowrap' as const,
    };
  };

  const statusOptions = getEnumOptions(AttendanceStatus);
  const cols = showUserFilter ? 4 : 3;

  const currentInputStyle = isMobile ? {
    ...inputStyle,
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
  } : inputStyle;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      border: '1px solid #f3f4f6',
      padding: isMobile ? '16px' : '20px 24px',
      marginBottom: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      {/* Quick-select date range buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '4px' }}>
          Quick:
        </span>
        <button
          style={quickBtnStyle('today')}
          onClick={() => applyQuickRange('today', today, today)}
        >
          Today
        </button>
        <button
          style={quickBtnStyle('7days')}
          onClick={() => applyQuickRange('7days', last7Start, today)}
        >
          Last 7 Days
        </button>
        <button
          style={quickBtnStyle('month')}
          onClick={() => applyQuickRange('month', monthStart, today)}
        >
          This Month
        </button>
      </div>

      {/* Date range + status + optional employee inputs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : `repeat(${cols}, 1fr)`,
        gap: isMobile ? '12px' : '16px',
        alignItems: 'end',
      }}>
        <div>
          <label style={labelStyle}>Start Date</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            style={currentInputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>End Date</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            style={currentInputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            style={currentInputStyle}
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
              style={currentInputStyle}
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
          onClick={() => {
            setActivePreset(null);
            onFilterChange({ startDate: undefined, endDate: undefined, status: undefined, userId: undefined });
          }}
          style={isMobile ? {
            padding: '10px 18px',
            background: '#f1f5f9',
            color: '#475569',
            border: 'none',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s',
            width: '100%',
            textAlign: 'center'
          } : {
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
          onMouseEnter={(e) => {
            if (isMobile) return;
            e.currentTarget.style.background = '#e5e7eb';
          }}
          onMouseLeave={(e) => {
            if (isMobile) return;
            e.currentTarget.style.background = '#f3f4f6';
          }}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default AttendanceFilters;
