import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { LoadingSpinner, Card, Button } from '../../../components/ui';
import AttendanceTable from '../../shared/attendance/components/AttendanceTable';
import AttendanceFilters from '../../shared/attendance/components/AttendanceFilters';
import AttendanceStatusBadge from '../../shared/attendance/components/AttendanceStatusBadge';

interface Statistics {
  totalRecords: number;
  averageHours: number;
  presentCount: number;
  lateCount: number;
  halfDayCount: number;
  wfhCount: number;
  absentCount: number;
}

const AttendanceDashboardPage = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({ page: 1, limit: 20 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [statistics, setStatistics] = useState<Statistics>({
    totalRecords: 0,
    averageHours: 0,
    presentCount: 0,
    lateCount: 0,
    halfDayCount: 0,
    wfhCount: 0,
    absentCount: 0,
  });

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      if (filters.userId) params.append('userId', filters.userId);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const response = await api.get(`/attendance?${params.toString()}`);
      const data: any[] = response.data.data || [];
      setAttendance(data);

      if (response.data.total !== undefined) {
        setPagination({
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        });
      }

      // Derive statistics from Attendance status field
      const totalHours = data.reduce((sum, r) => sum + (r.totalHours || 0), 0);
      setStatistics({
        totalRecords: data.length,
        averageHours: data.length > 0 ? totalHours / data.length : 0,
        presentCount: data.filter((r) => r.status === 'PRESENT').length,
        lateCount: data.filter((r) => r.status === 'LATE').length,
        halfDayCount: data.filter((r) => r.status === 'HALF_DAY').length,
        wfhCount: data.filter((r) => r.status === 'WFH').length,
        absentCount: data.filter((r) => r.status === 'ABSENT').length,
      });
    } catch (err: any) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Records', value: statistics.totalRecords, color: '#1a1a1a' },
    { label: 'Avg Hours/Day', value: `${statistics.averageHours.toFixed(1)}h`, color: '#1a1a1a' },
    { label: 'Present', value: statistics.presentCount, color: '#15803d' },
    { label: 'Late', value: statistics.lateCount, color: '#d97706' },
    { label: 'WFH', value: statistics.wfhCount, color: '#7c3aed' },
    { label: 'Half Day', value: statistics.halfDayCount, color: '#d97706' },
    { label: 'Absent', value: statistics.absentCount, color: '#dc2626' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
          Attendance Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: '#666666' }}>
          Monitor and manage attendance records across the organization
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {statCards.map((card) => (
          <Card key={card.label} padding="md">
            <div style={{ fontSize: '13px', color: '#666666', marginBottom: '8px' }}>{card.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 600, color: card.color }}>{card.value}</div>
          </Card>
        ))}
      </div>

      <AttendanceFilters filters={filters} onFilterChange={(f) => setFilters({ ...f, page: 1, limit: 20 })} showUserFilter={true} />

      {loading ? (
        <Card>
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <LoadingSpinner size="lg" text="Loading attendance records..." />
          </div>
        </Card>
      ) : (
        <>
          <AttendanceTable data={attendance} showUserColumn={true} />

          {pagination.totalPages > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
              <Button onClick={() => setFilters({ ...filters, page: filters.page - 1 })} disabled={filters.page === 1} variant="primary" size="sm">
                Previous
              </Button>
              <span style={{ fontSize: '14px', color: '#666666' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button onClick={() => setFilters({ ...filters, page: filters.page + 1 })} disabled={filters.page === pagination.totalPages} variant="primary" size="sm">
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceDashboardPage;
