import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { LoadingSpinner } from '../../../components/ui';
import AttendanceTable from '../../shared/attendance/components/AttendanceTable';
import AttendanceFilters from '../../shared/attendance/components/AttendanceFilters';
import { todayLocalDateStr, formatISTDate } from '../../../utils/date.util';

interface Statistics {
  totalRecords: number;
  averageHours: number;
  presentCount: number;
  lateCount: number;
  halfDayCount: number;
  wfhCount: number;
  absentCount: number;
}

// ── Derive the context label shown above the stat cards ──────────────────────
function buildContextLabel(
  filters: any,
  employees: Array<{ id: string; firstName: string; lastName: string }>,
): string {
  const today = todayLocalDateStr();

  const employeeName = filters.userId
    ? (() => {
        const emp = employees.find((e) => e.id === filters.userId);
        return emp ? `${emp.firstName} ${emp.lastName}` : 'Employee';
      })()
    : null;

  const scope = employeeName ?? 'Company';

  const hasRange = filters.startDate && filters.endDate;
  const isToday =
    !hasRange ||
    (filters.startDate === today && filters.endDate === today);

  if (isToday) return `${scope} — Today`;

  const from = formatISTDate(filters.startDate);
  const to = formatISTDate(filters.endDate);
  return `${scope} — ${from} to ${to}`;
}

const AttendanceDashboardPage = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // ── NEW: employee list for the dropdown ──────────────────────────────────
  const [employees, setEmployees] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);
  const [filters, setFilters] = useState<any>({ page: 1, limit: 20 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [statistics, setStatistics] = useState<Statistics>({
    totalRecords: 0, averageHours: 0, presentCount: 0,
    lateCount: 0, halfDayCount: 0, wfhCount: 0, absentCount: 0,
  });

  // ── Load employee list once for the dropdown ─────────────────────────────
  useEffect(() => {
    api.get('/users')
      .then((res) => {
        const list = (res.data || []).map((u: any) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
        }));
        setEmployees(list);
      })
      .catch(() => {}); // non-critical — dropdown just stays empty
  }, []);

  useEffect(() => { fetchAttendance(); }, [filters]);

  // ── Resolve effective date params based on mode ──────────────────────────
  const resolveEffectiveDates = (f: any) => {
    const today = todayLocalDateStr();
    // Mode: Employee Today — employee selected but no date range → default to today
    if (f.userId && !f.startDate && !f.endDate) {
      return { startDate: today, endDate: today };
    }
    // Mode: Company Today — no employee, no date → default to today
    if (!f.userId && !f.startDate && !f.endDate) {
      return { startDate: today, endDate: today };
    }
    return { startDate: f.startDate, endDate: f.endDate };
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = resolveEffectiveDates(filters);

      const params = new URLSearchParams();
      if (startDate)      params.append('startDate', startDate);
      if (endDate)        params.append('endDate',   endDate);
      if (filters.status) params.append('status',    filters.status);
      if (filters.userId) params.append('userId',    filters.userId);
      params.append('page',  filters.page.toString());
      params.append('limit', filters.limit.toString());

      const response = await api.get(`/attendance?${params.toString()}`);
      const data: any[] = response.data.data || [];
      setAttendance(data);

      if (response.data.total !== undefined) {
        setPagination({
          total: response.data.total, page: response.data.page,
          limit: response.data.limit, totalPages: response.data.totalPages,
        });
      }

      const totalHours = data.reduce((sum, r) => sum + (r.totalHours || 0), 0);
      setStatistics({
        totalRecords:  data.length,
        averageHours:  data.length > 0 ? totalHours / data.length : 0,
        presentCount:  data.filter((r) => r.status === 'PRESENT').length,
        lateCount:     data.filter((r) => r.status === 'LATE').length,
        halfDayCount:  data.filter((r) => r.status === 'HALF_DAY').length,
        wfhCount:      data.filter((r) => r.status === 'WFH').length,
        absentCount:   data.filter((r) => r.status === 'ABSENT').length,
      });
    } catch (err: any) {
      console.error('Error fetching attendance:', err);
      // ── Data safety: reset to zeros on error ──
      setAttendance([]);
      setStatistics({ totalRecords: 0, averageHours: 0, presentCount: 0, lateCount: 0, halfDayCount: 0, wfhCount: 0, absentCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Present',   value: statistics.presentCount,                  accent: '#16a34a', bg: '#f0fdf4', icon: '✅' },
    { label: 'Late',      value: statistics.lateCount,                     accent: '#c2410c', bg: '#fff7ed', icon: '⏰' },
    { label: 'WFH',       value: statistics.wfhCount,                      accent: '#6d28d9', bg: '#f5f3ff', icon: '🏠' },
    { label: 'Half Day',  value: statistics.halfDayCount,                  accent: '#a16207', bg: '#fefce8', icon: '🌓' },
    { label: 'Absent',    value: statistics.absentCount,                   accent: '#b91c1c', bg: '#fef2f2', icon: '❌' },
    { label: 'Avg Hours', value: `${statistics.averageHours.toFixed(1)}h`, accent: '#0891b2', bg: '#f0f9ff', icon: '⏱️' },
    { label: 'Records',   value: statistics.totalRecords,                  accent: '#374151', bg: '#f9fafb', icon: '📋' },
  ];

  // ── Context label (Step 6) ───────────────────────────────────────────────
  const contextLabel = buildContextLabel(filters, employees);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
            Attendance Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Monitor and manage attendance records across the organization
          </p>
        </div>

        {/* ── Context indicator label ── */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '6px 14px',
          marginBottom: '16px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#1d4ed8',
        }}>
          📍 {contextLabel}
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {statCards.map((card) => (
            <div
              key={card.label}
              style={{
                background: card.bg, borderRadius: '16px', padding: '18px 20px',
                border: '1px solid transparent',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 0.15s, box-shadow 0.15s',
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
                <span style={{ fontSize: '11px', fontWeight: 600, color: card.accent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {card.label}
                </span>
                <span style={{ fontSize: '16px' }}>{card.icon}</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: card.accent, letterSpacing: '-0.02em' }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Filters — now passes employee list for the dropdown */}
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
            <AttendanceTable data={attendance} showUserColumn={true} />

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
      </div>
    </div>
  );
};

export default AttendanceDashboardPage;
