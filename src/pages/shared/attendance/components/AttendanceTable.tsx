interface AttendanceSession {
  id: string;
  checkIn: string;
  checkOut: string | null;
}

interface GroupedAttendance {
  userId: string;
  date: string;
  sessions: AttendanceSession[];
  totalHours: number;
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
  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateSessionDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return 'Running';
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const hours = (end - start) / (1000 * 60 * 60);
    return `${hours.toFixed(2)}h`;
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e5e5',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e5e5' }}>
              <th
                style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Date
              </th>
              {showUserColumn && (
                <th
                  style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#666666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Employee
                </th>
              )}
              <th
                style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Sessions
              </th>
              <th
                style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Total Hours
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((record) => (
              <tr
                key={`${record.userId}-${record.date}`}
                style={{
                  borderBottom: '1px solid #f0f0f0',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td
                  style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#1a1a1a',
                    fontWeight: 500,
                  }}
                >
                  {formatDate(record.date)}
                </td>
                {showUserColumn && record.user && (
                  <td
                    style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#1a1a1a',
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>
                      {record.user.firstName} {record.user.lastName}
                    </div>
                    {record.user.department && (
                      <div style={{ fontSize: '12px', color: '#666666', marginTop: '2px' }}>
                        {record.user.department}
                      </div>
                    )}
                  </td>
                )}
                <td
                  style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#666666',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {record.sessions.map((session) => (
                      <div
                        key={session.id}
                        style={{
                          display: 'flex',
                          gap: '12px',
                          padding: '6px 10px',
                          background: session.checkOut ? '#f9fafb' : '#f0f9ff',
                          borderRadius: '6px',
                          fontSize: '13px',
                        }}
                      >
                        <span style={{ fontWeight: 500, color: '#1f2937' }}>
                          {formatTime(session.checkIn)}
                        </span>
                        <span style={{ color: '#9ca3af' }}>→</span>
                        <span style={{ fontWeight: 500, color: session.checkOut ? '#1f2937' : '#0369a1' }}>
                          {formatTime(session.checkOut)}
                        </span>
                        <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '12px' }}>
                          {calculateSessionDuration(session.checkIn, session.checkOut)}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
                <td
                  style={{
                    padding: '16px',
                    fontSize: '16px',
                    color: '#10b981',
                    fontWeight: 600,
                  }}
                >
                  {record.totalHours.toFixed(2)}h
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#999999',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
          <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
            No attendance records found
          </div>
          <div style={{ fontSize: '14px' }}>
            Attendance records will appear here once check-ins are recorded
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;
