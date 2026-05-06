import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import { LoadingSpinner } from '../../../components/ui';
import AttendanceTable from './components/AttendanceTable';
import AttendanceFilters from './components/AttendanceFilters';
import AttendanceCalendar from '../../admin/attendance/components/AttendanceCalendar';
import { todayLocalDateStr, daysAgoLocalDateStr, formatISTDate } from '../../../utils/date.util';

const MyAttendancePage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeView, setActiveView] = useState<'table' | 'calendar'>('table')
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Default: last 30 days so the employee sees meaningful history immediately
  const [filters, setFilters] = useState<any>({
    startDate: daysAgoLocalDateStr(30),
    endDate: todayLocalDateStr(),
  });

  useEffect(() => { fetchAttendance(); }, [filters]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      const response = await api.get(`/attendance/my?${params.toString()}`);
      const data = response.data.data || response.data;
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  // Build a human-readable label for the current date range
  const rangeLabel = (() => {
    const today = todayLocalDateStr();
    const { startDate, endDate } = filters;
    if (!startDate && !endDate) return 'Today';
    if (startDate === today && endDate === today) return 'Today';
    if (!startDate) return `Up to ${formatISTDate(endDate)}`;
    if (!endDate)   return `From ${formatISTDate(startDate)}`;
    return `${formatISTDate(startDate)} — ${formatISTDate(endDate)}`;
  })();

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
            My Attendance
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            View your attendance history and daily records
          </p>
        </div>

        {/* View Tabs */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
          {(['table', 'calendar'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'none',
                fontSize: '14px',
                fontWeight: 500,
                color: activeView === v ? '#111827' : '#6b7280',
                cursor: 'pointer',
                borderBottom: activeView === v ? '2px solid #111827' : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'all 0.15s',
              }}
            >
              {v === 'table' ? '📋 Table View' : '📅 Calendar View'}
            </button>
          ))}
        </div>

        {activeView === 'table' && (
          <>
            {/* Filters */}
            <AttendanceFilters filters={filters} onFilterChange={setFilters} showUserFilter={false} />

            {/* Date range context */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '8px', padding: '6px 14px',
              marginBottom: '16px', fontSize: '13px', fontWeight: 600, color: '#15803d',
            }}>
              📅 Showing: {rangeLabel}
            </div>

            {/* Table */}
            {loading ? (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6', padding: '60px 24px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <LoadingSpinner size="lg" text="Loading attendance records..." />
              </div>
            ) : (
              <AttendanceTable
                data={attendance}
                showUserColumn={false}
                onRowClick={(record) => navigate('/app/attendance/session-detail', { state: record })}
              />
            )}
          </>
        )}

        {activeView === 'calendar' && user && (
          <AttendanceCalendar fixedUserId={user.id} hideEmployeeSelector hideAddHoliday />
        )}
      </div>
    </div>
  );
};

export default MyAttendancePage;
