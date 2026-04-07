import { useEffect, useState } from 'react';
import api from '../../../../utils/api';

interface Stats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateCheckIns: number;
  todayAttendance: number;
}

interface StatCard {
  label: string;
  value: string | number;
  accent: string;
  icon: string;
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

  const cards: StatCard[] = stats ? [
    { label: 'Total Employees', value: stats.totalEmployees, accent: '#6366f1', icon: '👥' },
    { label: 'Present Today',   value: stats.presentToday,   accent: '#16a34a', icon: '✅' },
    { label: 'Absent Today',    value: stats.absentToday,    accent: '#dc2626', icon: '❌' },
    { label: 'Late Check-ins',  value: stats.lateCheckIns,   accent: '#d97706', icon: '⏰' },
    { label: 'Attendance Rate', value: `${stats.todayAttendance}%`, accent: '#0891b2', icon: '📊' },
  ] : [];

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ background: '#f3f4f6', borderRadius: '16px', height: '96px', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            background: '#fff',
            border: '1px solid #f3f4f6',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'box-shadow 0.15s, transform 0.15s',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {card.label}
            </span>
            <span style={{ fontSize: '18px' }}>{card.icon}</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: card.accent, letterSpacing: '-0.02em' }}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendanceStats;
