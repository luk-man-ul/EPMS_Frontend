import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { LoadingSpinner, Card, Button } from '../../../components/ui';
import AttendanceTable from '../../shared/attendance/components/AttendanceTable';
import AttendanceFilters from '../../shared/attendance/components/AttendanceFilters';

const AttendanceDashboardPage = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [statistics, setStatistics] = useState({
    totalCheckIns: 0,
    averageHours: 0,
    lateCount: 0,
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

      const data = response.data.data || response.data;
      setAttendance(data);

      if (response.data.total !== undefined) {
        setPagination({
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        });
      }

      // Calculate statistics
      calculateStatistics(data);
    } catch (err: any) {
      console.error('Error fetching attendance:', err);
      alert(err.response?.data?.message || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data: any[]) => {
    // data is now grouped by date/user with sessions array
    const totalCheckIns = data.reduce((sum, record) => sum + record.sessions.length, 0);
    
    // Calculate average hours per day (not per session)
    const totalHours = data.reduce((sum, record) => sum + record.totalHours, 0);
    const averageHours = data.length > 0 ? totalHours / data.length : 0;

    // For now, we don't have status in session data
    // These would need to be calculated based on business rules
    const lateCount = 0;
    const absentCount = 0;

    setStatistics({
      totalCheckIns,
      averageHours,
      lateCount,
      absentCount,
    });
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...newFilters, page: 1, limit: 20 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '8px',
          }}
        >
          Attendance Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: '#666666' }}>
          Monitor and manage attendance records across the organization
        </p>
      </div>

      {/* Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        <Card padding="md">
          <div style={{ fontSize: '13px', color: '#666666', marginBottom: '8px' }}>
            Total Sessions
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#1a1a1a' }}>
            {statistics.totalCheckIns}
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '13px', color: '#666666', marginBottom: '8px' }}>
            Avg Hours/Day
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#1a1a1a' }}>
            {statistics.averageHours.toFixed(1)}h
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '13px', color: '#666666', marginBottom: '8px' }}>Late Count</div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#d97706' }}>
            {statistics.lateCount}
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '13px', color: '#666666', marginBottom: '8px' }}>
            Absent Count
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#dc2626' }}>
            {statistics.absentCount}
          </div>
        </Card>
      </div>

      <AttendanceFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        showUserFilter={true}
      />

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
            <div
              style={{
                marginTop: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                variant="primary"
                size="sm"
              >
                Previous
              </Button>
              <span style={{ fontSize: '14px', color: '#666666' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                variant="primary"
                size="sm"
              >
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
