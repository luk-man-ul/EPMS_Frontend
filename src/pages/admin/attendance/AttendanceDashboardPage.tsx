import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { LoadingSpinner } from '../../../components/ui';
import AttendanceTable from '../../shared/attendance/components/AttendanceTable';
import AttendanceFilters from '../../shared/attendance/components/AttendanceFilters';
import AttendanceCalendar from './components/AttendanceCalendar';
import { todayLocalDateStr, formatISTDate } from '../../../utils/date.util';

// ── Stats API response shape ─────────────────────────────────────────────────
interface AttendanceStatsResponse {
  totalEmployees: number;
  present: number;
  onsite: number;
  wfh: number;
  late: number;
  halfDay: number;
  onLeave: number;
  absent: number;
  meta?: { mode: string; totalDays: number; avgAttendance: number };
}

// ── Context label ────────────────────────────────────────────────────────────
function buildContextLabel(
  filters: any,
  employees: Array<{ id: string; firstName: string; lastName: string }>,
): string {
  const today = todayLocalDateStr();
  const emp = filters.userId ? employees.find((e) => e.id === filters.userId) : null;
  const scope = emp ? `${emp.firstName} ${emp.lastName}` : 'Company';
  const hasRange = filters.startDate && filters.endDate;
  const isToday = !hasRange || (filters.startDate === today && filters.endDate === today);
  if (isToday) return `${scope} — Today`;
  return `${scope} — ${formatISTDate(filters.startDate)} to ${formatISTDate(filters.endDate)}`;
}

// ── Resolve effective date params ────────────────────────────────────────────
function resolveEffectiveDates(f: any): { startDate: string; endDate: string } {
  const today = todayLocalDateStr();
  if (!f.startDate && !f.endDate) return { startDate: today, endDate: today };
  return { startDate: f.startDate, endDate: f.endDate };
}

// ── Stat card shape ──────────────────────────────────────────────────────────
interface StatCard {
  label: string;
  tooltip: string;
  value: number | string;
  accent: string;
  bg: string;
  icon: string;
}

// Build stat cards from the /attendance/stats API response (full dataset, not paginated)
function buildStatCardsFromApi(stats: AttendanceStatsResponse): StatCard[] {
  const attendanceRate = stats.meta?.avgAttendance !== undefined
    ? `${stats.meta.avgAttendance}%`
    : stats.totalEmployees > 0
      ? `${Math.round((stats.present / stats.totalEmployees) * 100)}%`
      : '—';

  return [
    {
      label: 'Present',
      tooltip: 'Employees who checked in (includes onsite, WFH, late, half-day)',
      value: stats.present,
      accent: '#16a34a', bg: '#f0fdf4', icon: '✅',
    },
    {
      label: 'Onsite',
      tooltip: 'Employees who checked in from the office (not WFH)',
      value: stats.onsite,
      accent: '#0891b2', bg: '#f0f9ff', icon: '🏢',
    },
    {
      label: 'WFH',
      tooltip: 'Employees working from home with an approved WFH request',
      value: stats.wfh,
      accent: '#6d28d9', bg: '#f5f3ff', icon: '🏠',
    },
    {
      label: 'Late (>11:00)',
      tooltip: 'Employees whose first check-in was after 11:00 AM IST',
      value: stats.late,
      accent: '#c2410c', bg: '#fff7ed', icon: '⏰',
    },
    {
      label: 'Half Day',
      tooltip: 'Employees who worked less than 4 hours (all sessions closed)',
      value: stats.halfDay,
      accent: '#a16207', bg: '#fefce8', icon: '🌓',
    },
    {
      label: 'On Leave',
      tooltip: 'Employees with an approved leave request and no check-in',
      value: stats.onLeave,
      accent: '#1d4ed8', bg: '#eff6ff', icon: '🏖️',
    },
    {
      label: 'Absent',
      tooltip: 'Employees with no check-in and no approved leave',
      value: stats.absent,
      accent: '#b91c1c', bg: '#fef2f2', icon: '❌',
    },
    {
      label: 'Attendance Rate',
      tooltip: 'Percentage of employees present out of total active employees',
      value: attendanceRate,
      accent: '#0891b2', bg: '#f0f9ff', icon: '📊',
    },
  ];
}

// ── Component ────────────────────────────────────────────────────────────────
const AttendanceDashboardPage = () => {
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState<'table' | 'calendar'>('table')
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AttendanceStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [employees, setEmployees] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);
  // Initialize with today's date so stats/table always have a defined range on first load.
  // resolveEffectiveDates() also guards against empty dates, but explicit init avoids
  // a flash of "no date" in the context label and filter inputs.
  const [filters, setFilters] = useState<any>({
    startDate: todayLocalDateStr(),
    endDate: todayLocalDateStr(),
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });

  // Load employee list once for the dropdown
  useEffect(() => {
    api.get('/users')
      .then((res) => setEmployees(
        (res.data || []).map((u: any) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName }))
      ))
      .catch(() => {});
  }, []);

  // Re-fetch table + stats whenever filters change
  useEffect(() => {
    fetchAttendance();
    fetchStats();
  }, [filters]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = resolveEffectiveDates(filters);

      const params = new URLSearchParams();
      if (startDate)      params.append('startDate', startDate);
      if (endDate)        params.append('endDate',   endDate);
      if (filters.status) params.append('status',    filters.status);
      if (filters.userId) params.append('userId',    filters.userId);
      params.append('page',  String(filters.page  ?? 1));
      params.append('limit', String(filters.limit ?? 20));

      const response = await api.get(`/attendance?${params.toString()}`);
      let data: any[] = response.data.data || [];

      // The backend injects today's live records at the top of every page.
      // On pages > 1, remove today's records so they only appear on page 1.
      if ((filters.page ?? 1) > 1) {
        const todayStr = new Date().toISOString().split('T')[0];
        // Also compute IST today string (UTC+5:30)
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istToday = new Date(Date.now() + istOffset).toISOString().split('T')[0];
        data = data.filter((r: any) => r.date !== todayStr && r.date !== istToday);
      }

      setAttendance(data);

      if (response.data.total !== undefined) {
        setPagination({
          total: response.data.total,
          page:  response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        });
      }
    } catch (err: any) {
      console.error('Error fetching attendance:', err);
      setAttendance([]);
      setPagination({ total: 0, page: 1, limit: 20, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats from the dedicated /attendance/stats endpoint.
  // This covers the FULL dataset (not just the current page), so the
  // numbers are always accurate regardless of pagination.
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const { startDate, endDate } = resolveEffectiveDates(filters);

      const params: Record<string, string> = {};
      if (startDate)      params.startDate = startDate;
      if (endDate)        params.endDate   = endDate;
      if (filters.userId) params.userId    = filters.userId;
      // Note: status filter is intentionally excluded from stats — stats always
      // reflect the full picture for the date range, not a filtered subset.

      const response = await api.get('/attendance/stats', { params });
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching attendance stats:', err);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  // ── Weekly hours for selected employee ──────────────────────────────────
  // Computed from the already-fetched attendance records when a single
  // employee is selected. No extra API call needed — totalHours is already
  // in each attendance record.
  const weeklyHours = useMemo(() => {
    if (!filters.userId) return null;
    // Sum totalHours across all fetched records for this employee
    const total = attendance.reduce((sum: number, r: any) => sum + (r.totalHours ?? 0), 0);
    return Math.round(total * 10) / 10; // one decimal place
  }, [filters.userId, attendance]);

  // Stat cards come from the API response, not from paginated table data
  // When a specific employee is selected, append the Weekly Hours card
  // directly into the grid so it sits right after "Attendance Rate"
  const statCards = useMemo(() => {
    const base = stats ? buildStatCardsFromApi(stats) : [];
    if (weeklyHours === null) return base;
    return [
      ...base,
      {
        label: 'Worked Hours',
        tooltip: 'Total hours worked in the selected date range (target: 35 hrs/week)',
        value: `${weeklyHours} `,
        accent: weeklyHours >= 40 ? '#16a34a' : '#7c3aed',
        bg: weeklyHours >= 40 ? '#f0fdf4' : '#faf5ff',
        icon: '⏱️',
      },
    ];
  }, [stats, weeklyHours]);
  const contextLabel = useMemo(() => buildContextLabel(filters, employees), [filters, employees]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
              Attendance Dashboard
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Monitor and manage attendance records across the organization
            </p>
          </div>
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

        {activeView === 'calendar' && (
          <AttendanceCalendar />
        )}

        {activeView === 'table' && (<>
        {/* Context indicator */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: '8px', padding: '6px 14px',
          marginBottom: '20px', fontSize: '13px', fontWeight: 600, color: '#1d4ed8',
        }}>
          📍 {contextLabel}
        </div>

        {/* Stat Cards — sourced from /attendance/stats (full dataset) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {statsLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ background: '#f3f4f6', borderRadius: '16px', height: '88px' }} />
              ))
            : statCards.map((card) => (
            <div
              key={card.label}
              title={card.tooltip}
              style={{
                background: card.bg, borderRadius: '16px', padding: '16px 18px',
                border: '1px solid transparent',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: card.accent, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.3 }}>
                  {card.label}
                </span>
                <span style={{ fontSize: '15px' }}>{card.icon}</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: card.accent, letterSpacing: '-0.02em' }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <AttendanceFilters
          filters={filters}
          onFilterChange={(f) => setFilters({ ...f, page: 1, limit: 20 })}
          showUserFilter={true}
          users={employees}
        />

        {/* Table */}
        {loading ? (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6', padding: '60px 24px', textAlign: 'center' }}>
            <LoadingSpinner size="lg" text="Loading attendance records..." />
          </div>
        ) : (
          <>
            <AttendanceTable
                data={attendance}
                showUserColumn={true}
                onRowClick={(record) => navigate('/admin/attendance/employee-detail', { state: record })}
              />

            {pagination.totalPages > 1 && (
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  style={{
                    padding: '8px 18px', borderRadius: '8px', border: '1px solid #e5e7eb',
                    background: filters.page === 1 ? '#f9fafb' : '#fff',
                    color: filters.page === 1 ? '#9ca3af' : '#374151',
                    fontSize: '13px', fontWeight: 500,
                    cursor: filters.page === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ← Previous
                </button>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.totalPages}
                  style={{
                    padding: '8px 18px', borderRadius: '8px', border: '1px solid #e5e7eb',
                    background: filters.page === pagination.totalPages ? '#f9fafb' : '#fff',
                    color: filters.page === pagination.totalPages ? '#9ca3af' : '#374151',
                    fontSize: '13px', fontWeight: 500,
                    cursor: filters.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
        </>)}
      </div>
    </div>
  );
};

export default AttendanceDashboardPage;
