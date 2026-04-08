import { useEffect, useState } from 'react';
import api from '../../../../utils/api';

interface AttendanceStatsResponse {
  totalEmployees: number;
  present: number;
  onsite: number;
  wfh: number;
  late: number;
  halfDay: number;
  onLeave: number;
  absent: number;
  meta?: {
    mode: string;
    totalDays: number;
    avgAttendance: number;
  };
}

interface StatCard {
  label: string;
  value: string | number;
  accent: string;
  icon: string;
}

interface AttendanceStatsProps {
  filters?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  };
}

const AttendanceStats = ({ filters = {} }: AttendanceStatsProps) => {
  const [stats, setStats] = useState<AttendanceStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Build params — only include defined values
    const params: Record<string, string> = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate)   params.endDate   = filters.endDate;
    if (filters.userId)    params.userId    = filters.userId;

    api.get('/attendance/stats', { params })
      .then((res) => setStats(res.data))
      .catch((err) => {
        console.error('Failed to load attendance stats', err);
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, [filters.startDate, filters.endDate, filters.userId]);

  // Attendance rate display:
  // - Range mode: use meta.avgAttendance (already a %)
  // - Single-day: compute from present / totalEmployees
  const attendanceRateDisplay = (): string => {
    if (!stats) return '—';
    if (stats.meta?.avgAttendance !== undefined) {
      return `${stats.meta.avgAttendance}%`;
    }
    if (stats.totalEmployees > 0) {
      const rate = Math.round((stats.present / stats.totalEmployees) * 100);
      return `${rate}%`;
    }
    return '—';
  };

  const cards: StatCard[] = stats ? [
    { label: 'Total Employees', value: stats.totalEmployees,      accent: '#6366f1', icon: '👥' },
    { label: 'Present Today',   value: stats.present,             accent: '#16a34a', icon: '✅' },
    { label: 'Absent Today',    value: stats.absent,              accent: '#dc2626', icon: '❌' },
    { label: 'Late Check-ins',  value: stats.late,                accent: '#d97706', icon: '⏰' },
    { label: 'Attendance Rate', value: attendanceRateDisplay(),   accent: '#0891b2', icon: '📊' },
  ] : [];

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ background: '#f3f4f6', borderRadius: '16px', height: '96px' }} />
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
