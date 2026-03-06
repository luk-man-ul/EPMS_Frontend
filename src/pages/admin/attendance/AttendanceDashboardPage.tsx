import { useState, useEffect } from 'react';
import axios from 'axios';
import AttendanceTable from '../../shared/attendance/components/AttendanceTable';
import AttendanceFilters from '../../shared/attendance/components/AttendanceFilters';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div style={{ fontSize: '13px', color: '#666666', marginBottom: '8px' }}>
            Total Sessions
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#1a1a1a' }}>
            {statistics.totalCheckIns}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div style={{ fontSize: '13px', color: '#666666', marginBottom: '8px' }}>
            Avg Hours/Day
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#1a1a1a' }}>
            {statistics.averageHours.toFixed(1)}h
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div style={{ fontSize: '13px', color: '#666666', marginBottom: '8px' }}>Late Count</div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#d97706' }}>
            {statistics.lateCount}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div style={{ fontSize: '13px', color: '#666666', marginBottom: '8px' }}>
            Absent Count
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#dc2626' }}>
            {statistics.absentCount}
          </div>
        </div>
      </div>

      <AttendanceFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        showUserFilter={true}
      />

      {loading ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e5e5',
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '16px', fontWeight: 500, color: '#666666' }}>
            Loading attendance records...
          </div>
        </div>
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
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={{
                  padding: '8px 16px',
                  background: pagination.page === 1 ? '#f3f4f6' : '#1a1a1a',
                  color: pagination.page === 1 ? '#9ca3af' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: '14px', color: '#666666' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                style={{
                  padding: '8px 16px',
                  background: pagination.page === pagination.totalPages ? '#f3f4f6' : '#1a1a1a',
                  color: pagination.page === pagination.totalPages ? '#9ca3af' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceDashboardPage;
