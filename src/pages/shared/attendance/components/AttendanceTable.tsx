import AttendanceStatusBadge from './AttendanceStatusBadge';
import { formatISTDate, formatTime } from '../../../../utils/date.util';

const formatHours = (decimal: number): string => {
  if (!decimal || decimal <= 0) return '—';
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

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
  status: string;
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
  onRowClick?: (record: GroupedAttendance) => void;
}

const th: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 600,
  color: '#9ca3af',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  background: '#f9fafb',
  borderBottom: '1px solid #f3f4f6',
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: '13px',
  color: '#374151',
  borderBottom: '1px solid #f3f4f6',
  verticalAlign: 'middle',
};

const AttendanceTable = ({ data, showUserColumn = false, onRowClick }: AttendanceTableProps) => {
  const headers = ['Date', ...(showUserColumn ? ['Employee'] : []), 'First In', 'Last Out', 'Hours', 'Status'];

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {headers.map((h) => <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((record) => {
              const firstIn = record.firstCheckIn ??
                [...(record.sessions ?? [])].sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())[0]?.checkIn;
              const lastOut = record.lastCheckOut ??
                [...(record.sessions ?? [])].sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()).filter((s) => s.checkOut).at(-1)?.checkOut;

              return (
                <tr
                  key={`${record.userId}-${record.date}`}
                  style={{ transition: 'background 0.15s', cursor: onRowClick ? 'pointer' : 'default' }}
                  onClick={() => onRowClick?.(record)}
                  onMouseEnter={(e) => { if (onRowClick) e.currentTarget.style.background = '#f0f9ff' }}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Date */}
                  <td style={{ ...td, fontWeight: 500, color: '#111827' }}>
                    {formatISTDate(record.date)}
                  </td>

                  {/* Employee */}
                  {showUserColumn && (
                    <td style={td}>
                      {record.user ? (
                        <div>
                          <div style={{ fontWeight: 500, color: '#111827' }}>
                            {record.user.firstName} {record.user.lastName}
                          </div>
                          {record.user.department && (
                            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                              {record.user.department}
                            </div>
                          )}
                        </div>
                      ) : '—'}
                    </td>
                  )}

                  {/* First In */}
                  <td style={{ ...td, fontFamily: 'monospace', fontWeight: 500, color: '#111827' }}>
                    {formatTime(firstIn)}
                  </td>

                  {/* Last Out */}
                  <td style={{ ...td, fontFamily: 'monospace', fontWeight: 500, color: '#111827' }}>
                    {formatTime(lastOut)}
                  </td>

                  {/* Total Hours */}
                  <td style={td}>
                    <span style={{ fontWeight: 700, color: record.totalHours > 0 ? '#16a34a' : '#9ca3af', fontSize: '14px' }}>
                      {formatHours(record.totalHours)}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={td}>
                    <AttendanceStatusBadge status={(record.status ?? 'ABSENT') as any} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>No records found</div>
          <div style={{ fontSize: '13px', color: '#9ca3af' }}>Records will appear here once check-ins are recorded</div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;
