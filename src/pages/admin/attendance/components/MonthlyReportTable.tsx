import { useEffect, useState } from 'react';
import api from '../../../../utils/api';

interface MonthlyRecord {
  userId: string;
  user?: { firstName: string; lastName: string; email: string; department?: string };
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalHalfDay: number;
  totalWfh: number;
  totalLeave: number;
  totalHours: number;
  attendancePercentage: number;
}

interface Props {
  month?: string; // YYYY-MM, defaults to current month
}

const MonthlyReportTable = ({ month }: Props) => {
  const [records, setRecords] = useState<MonthlyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [year, mon] = targetMonth.split('-').map(Number);
    const startDate = `${targetMonth}-01`;
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = `${targetMonth}-${String(lastDay).padStart(2, '0')}`;

    api.get(`/attendance?startDate=${startDate}&endDate=${endDate}&limit=1000`)
      .then((res) => {
        const data: any[] = res.data.data || [];

        // Aggregate per user
        const byUser = new Map<string, MonthlyRecord>();
        data.forEach((record: any) => {
          const uid = record.userId;
          if (!byUser.has(uid)) {
            byUser.set(uid, {
              userId: uid,
              user: record.user,
              totalPresent: 0,
              totalAbsent: 0,
              totalLate: 0,
              totalHalfDay: 0,
              totalWfh: 0,
              totalLeave: 0,
              totalHours: 0,
              attendancePercentage: 0,
            });
          }
          const agg = byUser.get(uid)!;
          agg.totalHours += record.totalHours || 0;
          switch (record.status) {
            case 'PRESENT':  agg.totalPresent++;  break;
            case 'LATE':     agg.totalLate++;     break;
            case 'HALF_DAY': agg.totalHalfDay++;  break;
            case 'WFH':      agg.totalWfh++;      break;
            case 'ABSENT':   agg.totalAbsent++;   break;
            case 'LEAVE':    agg.totalLeave++;     break;
          }
        });

        const result = Array.from(byUser.values()).map((r) => {
          const workingDays = r.totalPresent + r.totalLate + r.totalHalfDay + r.totalWfh + r.totalAbsent + r.totalLeave;
          r.attendancePercentage = workingDays > 0
            ? Math.round(((r.totalPresent + r.totalLate + r.totalWfh) / workingDays) * 1000) / 10
            : 0;
          r.totalHours = Math.round(r.totalHours * 100) / 100;
          return r;
        });

        setRecords(result);
      })
      .catch((err) => console.error('Failed to load monthly report', err))
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Loading monthly report...</div>;
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: 500, borderBottom: '1px solid #e5e5e5' }}>
            <th style={{ padding: '16px 20px', fontWeight: 500 }}>Employee</th>
            <th style={{ padding: '16px 20px', fontWeight: 500 }}>Department</th>
            <th style={{ padding: '16px 20px', fontWeight: 500, textAlign: 'center' }}>Present</th>
            <th style={{ padding: '16px 20px', fontWeight: 500, textAlign: 'center' }}>Late</th>
            <th style={{ padding: '16px 20px', fontWeight: 500, textAlign: 'center' }}>WFH</th>
            <th style={{ padding: '16px 20px', fontWeight: 500, textAlign: 'center' }}>Half Day</th>
            <th style={{ padding: '16px 20px', fontWeight: 500, textAlign: 'center' }}>Absent</th>
            <th style={{ padding: '16px 20px', fontWeight: 500, textAlign: 'center' }}>Total Hours</th>
            <th style={{ padding: '16px 20px', fontWeight: 500, textAlign: 'center' }}>Attendance %</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No records found</td>
            </tr>
          ) : (
            records.map((record) => (
              <tr
                key={record.userId}
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
                <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666' }}>{record.user?.department || '—'}</td>
                <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '14px', fontWeight: 500, color: '#15803d' }}>{record.totalPresent}</td>
                <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '14px', fontWeight: 500, color: '#d97706' }}>{record.totalLate}</td>
                <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '14px', fontWeight: 500, color: '#7c3aed' }}>{record.totalWfh}</td>
                <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '14px', fontWeight: 500, color: '#d97706' }}>{record.totalHalfDay}</td>
                <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '14px', fontWeight: 500, color: '#dc2626' }}>{record.totalAbsent}</td>
                <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{record.totalHours}h</td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <span style={{
                    padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                    backgroundColor: record.attendancePercentage >= 95 ? '#1a1a1a' : record.attendancePercentage >= 85 ? '#f0f0f0' : '#fafafa',
                    color: record.attendancePercentage >= 95 ? '#fff' : '#1a1a1a',
                    border: '1px solid #e5e5e5',
                  }}>
                    {record.attendancePercentage}%
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyReportTable;
