import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { formatISTDate, formatTime } from '../../../utils/date.util'
import AttendanceStatusBadge from '../../shared/attendance/components/AttendanceStatusBadge'

interface Session {
  id: string
  checkIn: string
  checkOut: string | null
}

interface RecordState {
  userId: string
  date: string
  sessions: Session[]
  totalHours: number
  status: string
  user?: { firstName: string; lastName: string; email: string; department?: string }
}

const sessionDuration = (s: Session): string => {
  if (!s.checkOut) return 'Active'
  const ms = new Date(s.checkOut).getTime() - new Date(s.checkIn).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const AttendanceEmployeeDetailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const record = location.state as RecordState | null

  // Go back to the right page depending on who's viewing
  const backPath = location.pathname.startsWith('/app') ? '/app/attendance/history' : '/admin/attendance'
  const backLabel = location.pathname.startsWith('/app') ? 'Back to My Attendance' : 'Back to Attendance'

  if (!record) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>No data found.</p>
        <button onClick={() => navigate(backPath)} style={backBtnStyle}>
          ← {backLabel}
        </button>
      </div>
    )
  }

  const name = record.user ? `${record.user.firstName} ${record.user.lastName}` : 'Employee'
  const initials = record.user
    ? `${record.user.firstName?.[0] ?? ''}${record.user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?'

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <button onClick={() => navigate(backPath)} style={backBtnStyle}>
        <ArrowLeft size={16} /> {backLabel}
      </button>

      {/* Hero */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ height: '72px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />
        <div style={{ padding: '0 28px 24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: 700, color: '#fff',
            border: '4px solid #fff', marginTop: '-32px', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ paddingTop: '12px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>{name}</h1>
              <AttendanceStatusBadge status={record.status as any} />
            </div>
            {record.user?.department && (
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>{record.user.department}</p>
            )}
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
              📅 {formatISTDate(record.date)}
            </p>
          </div>
          <div style={{ paddingTop: '16px', textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Total Hours</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: record.totalHours > 0 ? '#16a34a' : '#9ca3af' }}>
              {record.totalHours > 0 ? `${record.totalHours.toFixed(2)}h` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 20px', paddingBottom: '14px', borderBottom: '1px solid #f3f4f6' }}>
          Sessions — {record.sessions.length} session{record.sessions.length !== 1 ? 's' : ''}
        </h2>

        {record.sessions.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>No sessions recorded for this day.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {record.sessions.map((session, idx) => {
              const isActive = !session.checkOut
              return (
                <div key={session.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr 1fr 1fr',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: isActive ? '#eff6ff' : '#f9fafb',
                  border: `1px solid ${isActive ? '#bfdbfe' : '#e5e7eb'}`,
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: isActive ? '#3b82f6' : '#e5e7eb',
                    color: isActive ? '#fff' : '#6b7280',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700,
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>Check In</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', fontFamily: 'monospace' }}>
                      {formatTime(session.checkIn)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>Check Out</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: isActive ? '#3b82f6' : '#111827', fontFamily: 'monospace' }}>
                      {isActive ? 'Active' : formatTime(session.checkOut)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>Duration</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: isActive ? '#3b82f6' : '#16a34a' }}>
                      {sessionDuration(session)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const backBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '8px 16px', borderRadius: '10px',
  border: '1px solid #e5e5e5', background: '#fff',
  color: '#374151', fontWeight: 500, fontSize: '14px',
  cursor: 'pointer', width: 'fit-content',
}

export default AttendanceEmployeeDetailPage
