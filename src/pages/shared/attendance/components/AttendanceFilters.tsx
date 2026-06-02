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

const pillStyle = (isActive: boolean, isSelect: boolean = false): React.CSSProperties => ({
  flexShrink: 0,
  padding: isSelect ? '8px 28px 8px 14px' : '8px 14px',
  borderRadius: '9999px',
  border: isActive ? '1px solid #4f46e5' : '1px solid #cbd5e1',
  background: isActive 
    ? (isSelect 
        ? '#eef2ff url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%234f46e5\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 10px center / 12px' 
        : '#eef2ff')
    : (isSelect 
        ? '#fff url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%234b5563\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 10px center / 12px' 
        : '#fff'),
  color: isActive ? '#4f46e5' : '#374151',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  outline: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  fontFamily: 'inherit',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none',
  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
});

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

  const today      = todayLocalDateStr();
  const last7Start = daysAgoLocalDateStr(6); // 6 days ago + today = 7 days
  const monthStart = startOfMonthLocalDateStr();

  // Tracks which quick-select preset is active.
  const [activePreset, setActivePreset] = useState<QuickPreset>(() => {
    if (filters.startDate === today && filters.endDate === today) return 'today';
    if (filters.startDate === last7Start && filters.endDate === today) return '7days';
    if (filters.startDate === monthStart && filters.endDate === today) return 'month';
    return 'custom';
  });

  useEffect(() => {
    if (filters.startDate === today && filters.endDate === today) {
      setActivePreset('today');
    } else if (filters.startDate === last7Start && filters.endDate === today) {
      setActivePreset('7days');
    } else if (filters.startDate === monthStart && filters.endDate === today) {
      setActivePreset('month');
    } else {
      setActivePreset('custom');
    }
  }, [filters.startDate, filters.endDate, today, last7Start, monthStart]);

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

  if (isMobile) {
    const showCustomDatePills = activePreset === 'custom';
    const isAnyFilterActive = activePreset !== 'today' || !!filters.status || !!filters.userId;

    return (
      <>
        <style>{`
          .attendance-filters-pills::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div 
          className="attendance-filters-pills"
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: '8px',
            marginBottom: '16px',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Quick Preset Dropdown Pill */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select
              value={activePreset || 'today'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'today') {
                  applyQuickRange('today', today, today);
                } else if (val === '7days') {
                  applyQuickRange('7days', last7Start, today);
                } else if (val === 'month') {
                  applyQuickRange('month', monthStart, today);
                } else {
                  setActivePreset('custom');
                }
              }}
              style={pillStyle(activePreset !== 'today', true)}
            >
              <option value="today">Range: Today</option>
              <option value="7days">Range: Last 7 Days</option>
              <option value="month">Range: This Month</option>
              <option value="custom">Range: Custom</option>
            </select>
          </div>

          {/* Custom Date Pickers */}
          {showCustomDatePills && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>FROM</span>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  style={pillStyle(true)}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>TO</span>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  style={pillStyle(true)}
                />
              </div>
            </>
          )}

          {/* Status Selector Pill */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select
              value={filters.status || ''}
              onChange={(e) => handleChange('status', e.target.value)}
              style={pillStyle(!!filters.status, true)}
            >
              <option value="">Status: All</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>Status: {opt.label}</option>
              ))}
            </select>
          </div>

          {/* Employee Selector Pill */}
          {showUserFilter && (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select
                value={filters.userId || ''}
                onChange={(e) => handleChange('userId', e.target.value)}
                style={pillStyle(!!filters.userId, true)}
              >
                <option value="">Employee: All</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>Employee: {u.firstName} {u.lastName}</option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters Pill */}
          {isAnyFilterActive && (
            <button
              onClick={() => {
                setActivePreset('today');
                onFilterChange({ startDate: undefined, endDate: undefined, status: undefined, userId: undefined });
              }}
              style={{
                ...pillStyle(false),
                background: '#f1f5f9',
                borderColor: '#cbd5e1',
                color: '#475569',
                flexShrink: 0,
              }}
            >
              Clear ✕
            </button>
          )}
        </div>
      </>
    );
  }

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
