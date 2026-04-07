import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { LoadingSpinner, Card } from '../../../components/ui';
import AttendanceTable from './components/AttendanceTable';
import AttendanceFilters from './components/AttendanceFilters';

const MyAttendancePage = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});

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

      // /attendance/my returns paginated grouped session data
      // The backend already groups by date and calculates totalHours
      const response = await api.get(`/attendance/my?${params.toString()}`);
      const data = response.data.data || response.data;
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
          My Attendance
        </h1>
        <p style={{ fontSize: '14px', color: '#666666' }}>
          View your attendance history and records
        </p>
      </div>

      <AttendanceFilters filters={filters} onFilterChange={setFilters} showUserFilter={false} />

      {loading ? (
        <Card>
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <LoadingSpinner size="lg" text="Loading attendance records..." />
          </div>
        </Card>
      ) : (
        <AttendanceTable data={attendance} showUserColumn={false} />
      )}
    </div>
  );
};

export default MyAttendancePage;
