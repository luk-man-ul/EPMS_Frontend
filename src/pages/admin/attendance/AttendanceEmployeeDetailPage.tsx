import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { formatISTDate, formatTime } from '../../../utils/date.util'
import AttendanceStatusBadge from '../../shared/attendance/components/AttendanceStatusBadge'
import api from '../../../utils/api'

interface Session {
  id: string
  checkIn: string
  checkOut: string | null
  duration: number | null
}

interface RecordState {
  userId: string
  date: string          // YYYY-MM-DD — already IST-safe from backend
  totalHours: number
  status: string
  user?: { firstName: string; lastName: string; email: string; department?: string }
}

const formatDuration = (s: Session): string => {
  if (!s.checkOut) return 'Active'
  // Use backend-provided duration when available; fall back to client calculation
  if (s.duration !== null) {
    const h = Math.floor(s.duration)
    const m = Math.round((s.duration - h) * 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }
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

  // Sessions fetched from the dedicated API — works for today AND past dates.
  // record.sessions (from the main attendance list) is always [] for past days,
  // so we never rely on it here.
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)

  useEffect(() => {
    if (!record?.userId || !record?.date) return

    setSessionsLoading(true)
    setSessions([])

    // record.date is already YYYY-MM-DD (set by toISTDateString on the backend)
    api
      .get('/attendance/sessions', {
        params: { userId: record.userId, date: record.date },
      })
      .then((res) => setSessions(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Failed to fetch sessions:', err)
        setSessions([])
      })
      .finally(() => setSessionsLoading(false))
  }, [record?.userId, record?.date])

  if (!record) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>No data found.</p>
        <button onClick={() => navigate(-1)} style={backBtnStyle}>
          ← Back to Attendance
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

      <button onClick={() => navigate(-1)} style={backBtnStyle}>
        <ArrowLeft size={16} /> Back to Attendance
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
              {record.totalHours > 0 ? (() => {
                const h = Math.floor(record.totalHours)
                const m = Math.round((record.totalHours - h) * 60)
                if (h === 0) return `${m}m`
                if (m === 0) return `${h}h`
                return `${h}h ${m}m`
              })() : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 20px', paddingBottom: '14px', borderBottom: '1px solid #f3f4f6' }}>
          {sessionsLoading
            ? 'Sessions — loading…'
            : `Sessions — ${sessions.length} session${sessions.length !== 1 ? 's' : ''}`}
        </h2>

        {sessionsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2].map((i) => (
              <div key={i} style={{ height: '72px', borderRadius: '12px', background: '#f3f4f6', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>No sessions recorded for this day.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map((session, idx) => {
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
                      {formatDuration(session)}
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
