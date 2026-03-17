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
      const response = await api.get('/attendance/my');
      
      // Backend returns paginated session data
      const sessions = response.data.data || response.data;
      
      // Group sessions by date
      const grouped = groupSessionsByDate(sessions);
      
      // Apply client-side filtering
      let filteredData = grouped;
      
      if (filters.startDate) {
        filteredData = filteredData.filter((record: any) => {
          const recordDate = new Date(record.date);
          const filterDate = new Date(filters.startDate);
          return recordDate >= filterDate;
        });
      }
      
      if (filters.endDate) {
        filteredData = filteredData.filter((record: any) => {
          const recordDate = new Date(record.date);
          const filterDate = new Date(filters.endDate);
          return recordDate <= filterDate;
        });
      }
      
      setAttendance(filteredData);
    } catch (err: any) {
      console.error('Error fetching attendance:', err);
      alert(err.response?.data?.message || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const groupSessionsByDate = (sessions: any[]) => {
    const grouped = new Map<string, any>();

    sessions.forEach((session) => {
      const date = new Date(session.checkIn).toISOString().split('T')[0];

      if (!grouped.has(date)) {
        grouped.set(date, {
          userId: session.userId,
          user: session.user,
          date,
          sessions: [],
          totalHours: 0,
        });
      }

      const group = grouped.get(date);
      group.sessions.push(session);

      // Calculate hours if session is complete
      if (session.checkOut) {
        const hours = (new Date(session.checkOut).getTime() - new Date(session.checkIn).getTime()) / (1000 * 60 * 60);
        group.totalHours += hours;
      }
    });

    // Convert map to array and round total hours
    return Array.from(grouped.values()).map((group) => ({
      ...group,
      totalHours: Math.round(group.totalHours * 100) / 100,
    }));
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
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
          My Attendance
        </h1>
        <p style={{ fontSize: '14px', color: '#666666' }}>
          View your attendance history and records
        </p>
      </div>

      <AttendanceFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        showUserFilter={false}
      />

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
