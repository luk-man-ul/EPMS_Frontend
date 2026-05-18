import { useEffect, useState } from 'react'
import api from '../../../../utils/api'

// ── Types ────────────────────────────────────────────────────────────────────

type DayType = 'WORKING' | 'WEEKEND' | 'HOLIDAY'
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE' | 'WFH'

interface CalendarDay {
  date: string          // YYYY-MM-DD
  dayType: DayType
  holidayName?: string
  status?: AttendanceStatus
  firstCheckIn?: string
  lastCheckOut?: string
  totalHours?: number
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Format a UTC ISO timestamp to HH:MM IST */
function formatTimeIST(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/** YYYY-MM → "Month YYYY" */
function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })
}

/** Add/subtract months from a YYYY-MM string */
function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  const ny = d.getFullYear()
  const nm = String(d.getMonth() + 1).padStart(2, '0')
  return `${ny}-${nm}`
}

/** Current month as YYYY-MM */
function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/** Today as YYYY-MM-DD in IST */
function todayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

// ── Colour / label maps ───────────────────────────────────────────────────────

const STATUS_BG: Record<string, string> = {
  PRESENT:  '#16a34a',
  LATE:     '#d97706',
  HALF_DAY: '#7c3aed',
  ABSENT:   '#dc2626',
  LEAVE:    '#0891b2',
  WFH:      '#2563eb',
  WEEKEND:  '#9ca3af',
  HOLIDAY:  '#b45309',
  WORKED_WEEKEND: '#059669',
  WORKED_HOLIDAY: '#92400e',
}

const STATUS_LABEL: Record<string, string> = {
  PRESENT:  'Present',
  LATE:     'Late',
  HALF_DAY: 'Half Day',
  ABSENT:   'Absent',
  LEAVE:    'On Leave',
  WFH:      'WFH',
  WEEKEND:  'Weekend',
  HOLIDAY:  'Holiday',
  WORKED_WEEKEND: 'Worked on Weekend',
  WORKED_HOLIDAY: 'Worked on Holiday',
}

/**
 * Statuses that represent actual work performed.
 * Only these should render as WORKED_WEEKEND or WORKED_HOLIDAY.
 * ABSENT and LEAVE on a non-working day are stale/invalid rows and must
 * render as the plain day type (WEEKEND / HOLIDAY), not as "worked".
 */
const WORK_STATUSES = new Set<string>(['PRESENT', 'LATE', 'HALF_DAY', 'WFH'])

/** Derive a display key from dayType + status */
function displayKey(day: CalendarDay): string {
  if (day.dayType === 'HOLIDAY') {
    // Only show WORKED_HOLIDAY when the employee actually performed work
    return (day.status && WORK_STATUSES.has(day.status)) ? 'WORKED_HOLIDAY' : 'HOLIDAY'
  }
  if (day.dayType === 'WEEKEND') {
    // Only show WORKED_WEEKEND when the employee actually performed work
    return (day.status && WORK_STATUSES.has(day.status)) ? 'WORKED_WEEKEND' : 'WEEKEND'
  }
  return day.status ?? ''
}

// ── Component ─────────────────────────────────────────────────────────────────

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface AttendanceCalendarProps {
  /** When set, the calendar is locked to this userId (no employee selector shown) */
  fixedUserId?: string
  /** Hide the employee selector dropdown entirely */
  hideEmployeeSelector?: boolean
  /** Hide the Add Holiday button (for non-admin views) */
  hideAddHoliday?: boolean
}

const AttendanceCalendar = ({ fixedUserId, hideEmployeeSelector = false, hideAddHoliday = false }: AttendanceCalendarProps = {}) => {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth())
  const [selectedUserId, setSelectedUserId] = useState(fixedUserId ?? '')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(false)
  const [tooltip, setTooltip] = useState<{ day: CalendarDay; x: number; y: number } | null>(null)

  // Add Holiday modal state
  const [showAddHoliday, setShowAddHoliday] = useState(false)
  const [holidayForm, setHolidayForm] = useState({ date: '', name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!holidayForm.date || !holidayForm.name.trim()) return
    setFormError('')
    setSubmitting(true)
    try {
      await api.post('/holidays', {
        date: holidayForm.date,
        name: holidayForm.name.trim(),
        description: holidayForm.description.trim() || undefined,
      })
      setHolidayForm({ date: '', name: '', description: '' })
      setShowAddHoliday(false)
      // Refresh calendar to show new holiday
      if (selectedUserId) {
        setLoading(true)
        api.get('/attendance/calendar', { params: { userId: selectedUserId, month: selectedMonth } })
          .then((res) => setCalendarData(res.data))
          .catch(() => setCalendarData([]))
          .finally(() => setLoading(false))
      }
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to add holiday')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Fetch employee list (skip when fixedUserId is provided) ─────────────────
  useEffect(() => {
    if (fixedUserId) return  // no need to load employee list when locked to one user
    api.get('/users', { params: { page: 1, limit: 200 } })
      .then((res) => {
        const list: Employee[] = res.data.data || res.data || []
        setEmployees(list)
        if (list.length > 0 && !selectedUserId) {
          setSelectedUserId(list[0].id)
        }
      })
      .catch((err) => console.error('Failed to load employees', err))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch calendar data when user or month changes ──────────────────────────
  useEffect(() => {
    if (!selectedUserId) return
    setLoading(true)
    api.get('/attendance/calendar', { params: { userId: selectedUserId, month: selectedMonth } })
      .then((res) => setCalendarData(res.data))
      .catch((err) => {
        console.error('Failed to load calendar data', err)
        setCalendarData([])
      })
      .finally(() => setLoading(false))
  }, [selectedUserId, selectedMonth])

  // ── Build calendar grid ─────────────────────────────────────────────────────
  const [year, mon] = selectedMonth.split('-').map(Number)
  const firstDayOfWeek = new Date(year, mon - 1, 1).getDay() // 0 = Sun
  const today = todayIST()

  // Map date string → CalendarDay for O(1) lookup
  const dayMap = new Map(calendarData.map((d) => [d.date, d]))

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '24px' }}>

      {/* ── Controls ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>

        {/* Employee selector */}
        {!hideEmployeeSelector && (
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '14px', minWidth: '200px', cursor: 'pointer', outline: 'none' }}
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
        )}

        {/* Month navigation + Add Holiday button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
          <button
            onClick={() => setSelectedMonth((m) => shiftMonth(m, -1))}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e5e5e5', background: '#fff', fontSize: '18px', cursor: 'pointer' }}
          >←</button>
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', minWidth: '140px', textAlign: 'center' }}>
            {formatMonthLabel(selectedMonth)}
          </span>
          <button
            onClick={() => setSelectedMonth((m) => shiftMonth(m, 1))}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e5e5e5', background: '#fff', fontSize: '18px', cursor: 'pointer' }}
          >→</button>

          <button
            onClick={() => { setShowAddHoliday(true); setFormError('') }}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: '#6366f1', color: '#fff',
              fontWeight: 600, fontSize: '13px', cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: hideAddHoliday ? 'none' : undefined,
            }}
          >
            + Add Holiday
          </button>
        </div>
      </div>

      {/* ── Add Holiday Modal ── */}
      {showAddHoliday && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddHoliday(false) }}
        >
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '28px',
            width: '100%', maxWidth: '480px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Add Holiday</h2>
              <button onClick={() => setShowAddHoliday(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            <form onSubmit={handleAddHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Date *</label>
                <input
                  type="date" required
                  value={holidayForm.date}
                  onChange={(e) => setHolidayForm((f) => ({ ...f, date: e.target.value }))}
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Name *</label>
                <input
                  type="text" required placeholder="e.g. Independence Day"
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm((f) => ({ ...f, name: e.target.value }))}
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Description (optional)</label>
                <input
                  type="text" placeholder="Optional"
                  value={holidayForm.description}
                  onChange={(e) => setHolidayForm((f) => ({ ...f, description: e.target.value }))}
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none' }}
                />
              </div>
              {formError && (
                <p style={{ fontSize: '13px', color: '#dc2626', fontWeight: 500, margin: 0 }}>⚠ {formError}</p>
              )}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button type="button" onClick={() => setShowAddHoliday(false)}
                  style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#374151' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: submitting ? '#a5b4fc' : '#6366f1', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'Adding…' : '+ Add Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} style={{ height: '64px', borderRadius: '8px', background: '#f3f4f6' }} />
          ))}
        </div>
      )}

      {/* ── Calendar grid ── */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>

          {/* Week day headers */}
          {WEEK_DAYS.map((wd) => (
            <div key={wd} style={{ padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
              {wd}
            </div>
          ))}

          {/* Leading empty cells */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {calendarData.map((day) => {
            const key = displayKey(day)
            const bg = STATUS_BG[key] ?? '#f9fafb'
            const label = STATUS_LABEL[key] ?? ''
            const isToday = day.date === today
            const dayNum = parseInt(day.date.split('-')[2], 10)

            return (
              <div
                key={day.date}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setTooltip({ day, x: rect.left, y: rect.bottom + 6 })
                }}
                onMouseLeave={() => setTooltip(null)}
                style={{
                  borderRadius: '8px',
                  padding: '8px 6px',
                  minHeight: '64px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  background: bg,
                  border: isToday ? '2px solid #1a1a1a' : '1px solid transparent',
                  cursor: 'default',
                  transition: 'opacity 0.15s',
                  opacity: 1,
                }}
                onMouseOver={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '0.85' }}
                onMouseOut={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '1' }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: key ? '#fff' : '#374151' }}>
                  {dayNum}
                </span>
                {label && (
                  <span style={{ fontSize: '9px', fontWeight: 500, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>
                    {label}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Tooltip ── */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            top: tooltip.y,
            left: Math.min(tooltip.x, window.innerWidth - 220),
            zIndex: 9999,
            background: '#1a1a1a',
            color: '#fff',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '12px',
            lineHeight: 1.6,
            pointerEvents: 'none',
            minWidth: '180px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>{tooltip.day.date}</div>
          {tooltip.day.holidayName && (
            <div>🎉 {tooltip.day.holidayName}</div>
          )}
          {tooltip.day.status && (
            <>
              <div>Status: {STATUS_LABEL[tooltip.day.status] ?? tooltip.day.status}</div>
              {tooltip.day.firstCheckIn && <div>In: {formatTimeIST(tooltip.day.firstCheckIn)}</div>}
              {tooltip.day.lastCheckOut && <div>Out: {formatTimeIST(tooltip.day.lastCheckOut)}</div>}
              {tooltip.day.totalHours != null && (
                <div>Hours: {tooltip.day.totalHours.toFixed(1)}h</div>
              )}
            </>
          )}
          {!tooltip.day.status && tooltip.day.dayType === 'WORKING' && (
            <div style={{ color: '#9ca3af' }}>No record</div>
          )}
        </div>
      )}

      {/* ── Legend ── */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f5f5f5', flexWrap: 'wrap' }}>
        {[
          { key: 'PRESENT',        label: 'Present' },
          { key: 'LATE',           label: 'Late' },
          { key: 'HALF_DAY',       label: 'Half Day' },
          { key: 'ABSENT',         label: 'Absent' },
          { key: 'LEAVE',          label: 'Leave' },
          { key: 'WFH',            label: 'WFH' },
          { key: 'WEEKEND',        label: 'Weekend' },
          { key: 'HOLIDAY',        label: 'Holiday' },
          { key: 'WORKED_WEEKEND', label: 'Worked on Weekend' },
          { key: 'WORKED_HOLIDAY', label: 'Worked on Holiday' },
        ].map(({ key, label }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: STATUS_BG[key] }} />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AttendanceCalendar
