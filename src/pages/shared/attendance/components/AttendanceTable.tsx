import AttendanceStatusBadge from './AttendanceStatusBadge';
import { formatISTDate, formatTime } from '../../../../utils/date.util';

interface AttendanceSession {
  id: string;
  checkIn: string;
  checkOut: string | null;
}

interface GroupedAttendance {
  userId: string;
  date: string;
  firstCheckIn?: string | null;
  lastCheckOut?: string | null;
  sessions: AttendanceSession[];
  totalHours: number;
  status?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
  };
}

interface AttendanceTableProps {
  data: GroupedAttendance[];
  showUserColumn?: boolean;
}

const AttendanceTable = ({ data, showUserColumn = false }: AttendanceTableProps) => {
  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e5e5' }}>
              {['Date', ...(showUserColumn ? ['Employee'] : []), 'First In', 'Last Out', 'Total Hours', 'Status', 'Sessions'].map((h) => (
                <th key={h} style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((record) => (
              <tr
                key={`${record.userId}-${record.date}`}
                style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '16px', fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
                  {formatISTDate(record.date)}
                </td>

                {showUserColumn && record.user && (
                  <td style={{ padding: '16px', fontSize: '14px', color: '#1a1a1a' }}>
                    <div style={{ fontWeight: 500 }}>{record.user.firstName} {record.user.lastName}</div>
                    {record.user.department && (
                      <div style={{ fontSize: '12px', color: '#666666', marginTop: '2px' }}>{record.user.department}</div>
                    )}
                  </td>
                )}

                {/* First check-in — prefer firstCheckIn field, fall back to first session */}
                <td style={{ padding: '16px', fontSize: '14px', color: '#1a1a1a', fontFamily: 'monospace' }}>
                  {formatTime(record.firstCheckIn ?? record.sessions?.[0]?.checkIn)}
                </td>

                {/* Last check-out — prefer lastCheckOut field, fall back to last completed session */}
                <td style={{ padding: '16px', fontSize: '14px', color: '#1a1a1a', fontFamily: 'monospace' }}>
                  {formatTime(record.lastCheckOut ?? record.sessions?.filter((s) => s.checkOut).at(-1)?.checkOut)}
                </td>

                <td style={{ padding: '16px', fontSize: '16px', color: '#10b981', fontWeight: 600 }}>
                  {record.totalHours > 0 ? `${record.totalHours.toFixed(2)}h` : '—'}
                </td>

                <td style={{ padding: '16px' }}>
                  {record.status ? (
                    <AttendanceStatusBadge status={record.status as any} />
                  ) : record.sessions?.some((s: any) => !s.checkOut) ? (
                    <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #e5e5e5' }}>
                      In Progress
                    </span>
                  ) : record.sessions?.length > 0 ? (
                    <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #e5e5e5' }}>
                      Checked In
                    </span>
                  ) : (
                    <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, backgroundColor: '#f5f5f5', color: '#999', border: '1px solid #e5e5e5' }}>
                      —
                    </span>
                  )}
                </td>

                <td style={{ padding: '16px', fontSize: '14px', color: '#666666' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {record.sessions?.map((session) => (
                      <div key={session.id} style={{ display: 'flex', gap: '8px', padding: '4px 8px', background: session.checkOut ? '#f9fafb' : '#f0f9ff', borderRadius: '6px', fontSize: '12px' }}>
                        <span style={{ fontWeight: 500, color: '#1f2937' }}>{formatTime(session.checkIn)}</span>
                        <span style={{ color: '#9ca3af' }}>→</span>
                        <span style={{ fontWeight: 500, color: session.checkOut ? '#1f2937' : '#0369a1' }}>{formatTime(session.checkOut)}</span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#999999' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
          <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>No attendance records found</div>
          <div style={{ fontSize: '14px' }}>Records will appear here once check-ins are recorded</div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;
