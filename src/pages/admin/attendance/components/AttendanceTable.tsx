import { useEffect, useState } from 'react';
import api from '../../../../utils/api';
import AttendanceStatusBadge from '../../../shared/attendance/components/AttendanceStatusBadge';

interface Session {
  id: string;
  checkIn: string;
  checkOut: string | null;
}

interface AttendanceRecord {
  userId: string;
  date: string;
  firstCheckIn: string | null;
  lastCheckOut: string | null;
  totalHours: number;
  status: string;
  sessions: Session[];
  user?: { firstName: string; lastName: string; email: string; department?: string };
}

const formatTime = (dateString: string | null) => {
  if (!dateString) return '--:--';
  return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const AttendanceTable = () => {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    api.get(`/attendance?startDate=${today}&endDate=${today}&limit=100`)
      .then((res) => setData(res.data.data || []))
      .catch((err) => console.error('Failed to load attendance', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Loading...</div>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: 500, borderBottom: '1px solid #e5e5e5' }}>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>Employee</th>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>Department</th>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>First Check-in</th>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>Last Check-out</th>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>Total Hours</th>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
              No attendance records for today
            </td>
          </tr>
        ) : (
          data.map((record) => (
            <tr
              key={`${record.userId}-${record.date}`}
              style={{ borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <td style={{ padding: '16px 20px' }}>
                <div style={{ fontWeight: 500, color: '#1a1a1a', fontSize: '14px' }}>
                  {record.user ? `${record.user.firstName} ${record.user.lastName}` : record.userId}
                </div>
                {record.user?.email && (
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{record.user.email}</div>
                )}
              </td>
              <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666' }}>
                {record.user?.department || '—'}
              </td>
              <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 500, color: '#1a1a1a', fontFamily: 'monospace' }}>
                {formatTime(record.firstCheckIn)}
              </td>
              <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 500, color: '#1a1a1a', fontFamily: 'monospace' }}>
                {formatTime(record.lastCheckOut)}
              </td>
              <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                {record.totalHours > 0 ? `${record.totalHours.toFixed(2)}h` : '—'}
              </td>
              <td style={{ padding: '16px 20px' }}>
                <AttendanceStatusBadge status={record.status as any} />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default AttendanceTable;
