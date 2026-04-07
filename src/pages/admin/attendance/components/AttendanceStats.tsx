import { useEffect, useState } from 'react';
import api from '../../../../utils/api';

interface Stats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateCheckIns: number;
  todayAttendance: number;
}

const AttendanceStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => console.error('Failed to load attendance stats', err))
      .finally(() => setLoading(false));
  }, []);

  const items = stats
    ? [
        { label: 'Total Employees', value: stats.totalEmployees, color: '#1a1a1a' },
        { label: 'Present Today', value: stats.presentToday, color: '#15803d' },
        { label: 'Absent', value: stats.absentToday, color: '#dc2626' },
        { label: 'Late Check-ins', value: stats.lateCheckIns, color: '#d97706' },
        { label: 'Attendance Rate', value: `${stats.todayAttendance}%`, color: '#1a1a1a' },
      ]
    : [];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    }}>
      {loading
        ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ background: '#f5f5f5', borderRadius: '12px', padding: '20px', height: '80px' }} />
          ))
        : items.map((stat) => (
            <div
              key={stat.label}
              style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '20px', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d4d4d4'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{stat.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: stat.color, letterSpacing: '-0.02em' }}>{stat.value}</div>
            </div>
          ))}
    </div>
  );
};

export default AttendanceStats;
