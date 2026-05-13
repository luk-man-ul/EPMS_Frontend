import { useState, useEffect } from 'react'
import api from '../../../../utils/api'

interface MonthStats {
  month: string        // e.g. "May 2026"
  startDate: string
  endDate: string
  totalEmployees: number
  present: number
  absent: number
  late: number
  halfDay: number
  onLeave: number
  wfh: number
  avgAttendance: number
}

/** Returns the first and last day of a month as YYYY-MM-DD */
function getMonthRange(year: number, month: number): { startDate: string; endDate: string } {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0) // last day of month
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { startDate: fmt(start), endDate: fmt(end) }
}

/** Format month label */
function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

const AttendanceSummaryReport = () => {
  const [months, setMonths] = useState<MonthStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Build last 3 months (including current)
        const now = new Date()
        const targets: { year: number; month: number }[] = []
        for (let i = 2; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          targets.push({ year: d.getFullYear(), month: d.getMonth() })
        }

        // Fetch stats for each month in parallel
        const results = await Promise.all(
          targets.map(async ({ year, month }) => {
            const { startDate, endDate } = getMonthRange(year, month)
            const res = await api.get('/attendance/stats', { params: { startDate, endDate } })
            const d = res.data
            return {
              month: monthLabel(year, month),
              startDate,
              endDate,
              totalEmployees: d.totalEmployees ?? 0,
              present: d.present ?? 0,
              absent: d.absent ?? 0,
              late: d.late ?? 0,
              halfDay: d.halfDay ?? 0,
              onLeave: d.onLeave ?? 0,
              wfh: d.wfh ?? 0,
              avgAttendance: d.meta?.avgAttendance ?? (
                d.totalEmployees > 0
                  ? Math.round((d.present / d.totalEmployees) * 100)
                  : 0
              ),
            } as MonthStats
          })
        )

        setMonths(results)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load attendance data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
        Loading attendance data...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '24px', background: '#fef2f2', borderRadius: '12px', color: '#dc2626', fontSize: '14px' }}>
        {error}
      </div>
    )
  }

  return (
    <div>
      {/* ── Monthly Cards ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '24px',
      }}>
        {months.map((m, index) => {
          const isDark = index === months.length - 1
          const textColor = isDark ? '#fff' : '#1a1a1a'
          const subColor = isDark ? '#9ca3af' : '#666'
          const dividerColor = isDark ? 'rgba(255,255,255,0.1)' : '#f5f5f5'

          return (
            <div
              key={m.month}
              style={{
                background: isDark ? '#1a1a1a' : '#fff',
                border: isDark ? 'none' : '1px solid #e5e5e5',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: textColor, marginBottom: '20px' }}>
                {m.month}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Avg attendance rate */}
                <div>
                  <div style={{ fontSize: '13px', color: subColor, marginBottom: '4px' }}>
                    Avg Attendance Rate
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: textColor }}>
                    {m.avgAttendance}%
                  </div>
                </div>

                {/* Stats grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  paddingTop: '16px',
                  borderTop: `1px solid ${dividerColor}`,
                }}>
                  {[
                    { label: 'Present',  value: m.present },
                    { label: 'Absent',   value: m.absent },
                    { label: 'Late',     value: m.late },
                    { label: 'Half Day', value: m.halfDay },
                    { label: 'On Leave', value: m.onLeave },
                    { label: 'WFH',      value: m.wfh },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: '11px', color: subColor, marginBottom: '4px' }}>{label}</div>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: textColor }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Breakdown bars ────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '20px' }}>
          Monthly Attendance Breakdown
        </h3>

        {months.map((m, index) => {
          const total = m.present + m.absent + m.late + m.halfDay + m.onLeave + m.wfh
          const pct = (n: number) => total > 0 ? ((n / total) * 100).toFixed(1) : '0.0'

          const bars = [
            { label: 'Present',  value: m.present,  color: '#16a34a' },
            { label: 'Late',     value: m.late,     color: '#d97706' },
            { label: 'Half Day', value: m.halfDay,  color: '#7c3aed' },
            { label: 'WFH',      value: m.wfh,      color: '#2563eb' },
            { label: 'On Leave', value: m.onLeave,  color: '#0891b2' },
            { label: 'Absent',   value: m.absent,   color: '#dc2626' },
          ]

          return (
            <div key={m.month} style={{ marginBottom: index < months.length - 1 ? '28px' : 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '14px' }}>
                {m.month}
                <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 400, marginLeft: '8px' }}>
                  {m.totalEmployees} employees
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {bars.map(({ label, value, color }) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', color: '#666' }}>{label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
                        {value} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({pct(value)}%)</span>
                      </span>
                    </div>
                    <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${total > 0 ? (value / total) * 100 : 0}%`,
                        background: color,
                        borderRadius: '3px',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {index < months.length - 1 && (
                <div style={{ height: '1px', background: '#f3f4f6', marginTop: '24px' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AttendanceSummaryReport
