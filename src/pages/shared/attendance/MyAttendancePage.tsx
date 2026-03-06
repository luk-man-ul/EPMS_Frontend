import { useState, useEffect } from 'react';
import axios from 'axios';
import AttendanceTable from './components/AttendanceTable';
import AttendanceFilters from './components/AttendanceFilters';

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
        <AttendanceTable data={attendance} showUserColumn={false} />
      )}
    </div>
  );
};

export default MyAttendancePage;
