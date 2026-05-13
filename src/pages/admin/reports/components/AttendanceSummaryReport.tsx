import { useState, useEffect, useCallback } from 'react'
import api from '../../../../utils/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthStats {
  month: string        // display label e.g. "May 2026"
  startDate: string    // YYYY-MM-DD
  endDate: string      // YYYY-MM-DD
  totalEmployees: number
  // Raw employee-day counts (from backend range mode)
  present: number      // includes LATE + HALF_DAY + WFH
  absent: number
  late: number         // sub-dimension of present
  halfDay: number      // sub-dimension of present
  onLeave: number
  wfh: number          // sub-dimension of present
  onsite: number       // present - wfh
  // Derived
  attendanceRate: number  // from meta.avgAttendance (mathematically correct)
  totalWorkingDays: number // from meta.totalDays
}

// Trend between two consecutive months
interface MonthTrend {
  attendanceRate: number | null   // +/- percentage points
  absent: number | null
  late: number | null
}

// ─── Date helpers (IST-safe) ──────────────────────────────────────────────────

/**
 * Build YYYY-MM-DD strings for the first and last day of a month.
 * Uses UTC-based construction to avoid local-timezone day shifts.
 * In IST (UTC+5:30), new Date(year, month, 1).toISOString() would return
 * the previous day — this avoids that entirely.
 */
function getMonthRange(year: number, month: number): { startDate: string; endDate: string } {
  // Last day of month: day 0 of next month
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    startDate: `${year}-${pad(month + 1)}-01`,
    endDate:   `${year}-${pad(month + 1)}-${pad(lastDay)}`,
  }
}

/** Build YYYY-MM-DD for an arbitrary date without timezone shift */
function toDateString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

// ─── Preset filter options ────────────────────────────────────────────────────

type PresetKey = 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'last3Months' | 'custom'

interface Preset {
  key: PresetKey
  label: string
}

const PRESETS: Preset[] = [
  { key: 'last7',       label: 'Last 7 Days'   },
  { key: 'last30',      label: 'Last 30 Days'  },
  { key: 'thisMonth',   label: 'This Month'    },
  { key: 'lastMonth',   label: 'Last Month'    },
  { key: 'last3Months', label: 'Last 3 Months' },
  { key: 'custom',      label: 'Custom Range'  },
]

interface DateRange {
  startDate: string
  endDate: string
}

/** Compute the date range for a given preset relative to today */
function getPresetRange(preset: PresetKey): DateRange | null {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()

  switch (preset) {
    case 'last7': {
      const end = toDateString(now)
      const start = new Date(now); start.setDate(start.getDate() - 6)
      return { startDate: toDateString(start), endDate: end }
    }
    case 'last30': {
      const end = toDateString(now)
      const start = new Date(now); start.setDate(start.getDate() - 29)
      return { startDate: toDateString(start), endDate: end }
    }
    case 'thisMonth':
      return getMonthRange(y, m)
    case 'lastMonth': {
      const prev = new Date(y, m - 1, 1)
      return getMonthRange(prev.getFullYear(), prev.getMonth())
    }
    case 'last3Months':
      return null // handled separately — returns multiple month buckets
    case 'custom':
      return null // user-supplied
    default:
      return null
  }
}

// ─── API fetch ────────────────────────────────────────────────────────────────

async function fetchMonthStats(
  year: number,
  month: number,
): Promise<MonthStats> {
  const { startDate, endDate } = getMonthRange(year, month)
  const res = await api.get('/attendance/stats', { params: { startDate, endDate } })
  const d = res.data

  // attendanceRate: always use meta.avgAttendance (backend formula is correct).
  // Fallback only if meta is absent (should not happen for range mode).
  const attendanceRate: number =
    d.meta?.avgAttendance ??
    (d.meta?.totalDays > 0 && d.totalEmployees > 0
      ? Math.round((d.present / (d.totalEmployees * d.meta.totalDays)) * 1000) / 10
      : 0)

  return {
    month:            monthLabel(year, month),
    startDate,
    endDate,
    totalEmployees:   d.totalEmployees   ?? 0,
    present:          d.present          ?? 0,
    absent:           d.absent           ?? 0,
    late:             d.late             ?? 0,
    halfDay:          d.halfDay          ?? 0,
    onLeave:          d.onLeave          ?? 0,
    wfh:              d.wfh              ?? 0,
    onsite:           d.onsite           ?? 0,
    attendanceRate,
    totalWorkingDays: d.meta?.totalDays  ?? 0,
  }
}

async function fetchRangeStats(startDate: string, endDate: string): Promise<MonthStats> {
  const res = await api.get('/attendance/stats', { params: { startDate, endDate } })
  const d = res.data

  const attendanceRate: number =
    d.meta?.avgAttendance ??
    (d.meta?.totalDays > 0 && d.totalEmployees > 0
      ? Math.round((d.present / (d.totalEmployees * d.meta.totalDays)) * 1000) / 10
      : 0)

  return {
    month:            `${startDate} → ${endDate}`,
    startDate,
    endDate,
    totalEmployees:   d.totalEmployees   ?? 0,
    present:          d.present          ?? 0,
    absent:           d.absent           ?? 0,
    late:             d.late             ?? 0,
    halfDay:          d.halfDay          ?? 0,
    onLeave:          d.onLeave          ?? 0,
    wfh:              d.wfh              ?? 0,
    onsite:           d.onsite           ?? 0,
    attendanceRate,
    totalWorkingDays: d.meta?.totalDays  ?? 0,
  }
}

// ─── Trend calculation ────────────────────────────────────────────────────────

/**
 * Compute month-over-month trend between two consecutive MonthStats.
 * All deltas are in percentage points (pp) relative to totalEmployees × totalWorkingDays.
 * Returns null for a metric when the previous month has no working days (divide-by-zero guard).
 */
function computeTrend(current: MonthStats, previous: MonthStats): MonthTrend {
  const prevBase = previous.totalEmployees * previous.totalWorkingDays
  const currBase = current.totalEmployees  * current.totalWorkingDays

  const deltaPct = (currVal: number, prevVal: number): number | null => {
    if (prevBase === 0 || currBase === 0) return null
    const currPct = (currVal / currBase) * 100
    const prevPct = (prevVal / prevBase) * 100
    return Math.round((currPct - prevPct) * 10) / 10
  }

  return {
    attendanceRate: current.attendanceRate - previous.attendanceRate === 0
      ? 0
      : Math.round((current.attendanceRate - previous.attendanceRate) * 10) / 10,
    absent: deltaPct(current.absent, previous.absent),
    late:   deltaPct(current.late,   previous.late),
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TrendBadge({ value, invertColor = false }: { value: number | null; invertColor?: boolean }) {
  if (value === null || value === 0) return null
  // invertColor=true means "higher is worse" (absent, late)
  const isPositive = invertColor ? value < 0 : value > 0
  const color  = isPositive ? '#16a34a' : '#dc2626'
  const bg     = isPositive ? '#f0fdf4' : '#fef2f2'
  const arrow  = value > 0 ? '↑' : '↓'
  const abs    = Math.abs(value)
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '2px',
      padding: '2px 7px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 600,
      color,
      background: bg,
      marginLeft: '8px',
    }}>
      {arrow} {abs}pp
    </span>
  )
}

function StatGrid({
  stats,
  textColor,
  subColor,
  dividerColor,
  trend,
}: {
  stats: MonthStats
  textColor: string
  subColor: string
  dividerColor: string
  trend?: MonthTrend
}) {
  const items = [
    { label: 'Present',   value: stats.present,  trendVal: null,         invertColor: false },
    { label: 'Absent',    value: stats.absent,   trendVal: trend?.absent ?? null, invertColor: true  },
    { label: 'Late',      value: stats.late,     trendVal: trend?.late   ?? null, invertColor: true  },
    { label: 'Half Day',  value: stats.halfDay,  trendVal: null,         invertColor: false },
    { label: 'On Leave',  value: stats.onLeave,  trendVal: null,         invertColor: false },
    { label: 'WFH',       value: stats.wfh,      trendVal: null,         invertColor: false },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      paddingTop: '16px',
      borderTop: `1px solid ${dividerColor}`,
    }}>
      {items.map(({ label, value, trendVal, invertColor }) => (
        <div key={label}>
          <div style={{ fontSize: '11px', color: subColor, marginBottom: '4px' }}>{label}</div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '2px' }}>
            <span style={{ fontSize: '18px', fontWeight: 600, color: textColor }}>{value}</span>
            {trendVal !== null && <TrendBadge value={trendVal} invertColor={invertColor} />}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const AttendanceSummaryReport = () => {
  const [months, setMonths]           = useState<MonthStats[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [showAll, setShowAll]         = useState(false)
  const [activePreset, setActivePreset] = useState<PresetKey>('last3Months')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd]     = useState('')
  const [customError, setCustomError] = useState<string | null>(null)

  // ── Data loading ───────────────────────────────────────────────────────────

  const loadLast3Months = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const now = new Date()
      const targets: { year: number; month: number }[] = []
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        targets.push({ year: d.getFullYear(), month: d.getMonth() })
      }
      const results = await Promise.all(
        targets.map(({ year, month }) => fetchMonthStats(year, month))
      )
      setMonths(results)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load attendance data')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadPreset = useCallback(async (preset: PresetKey) => {
    if (preset === 'last3Months') { await loadLast3Months(); return }
    if (preset === 'custom') return // handled by applyCustomRange

    const range = getPresetRange(preset)
    if (!range) return

    setLoading(true)
    setError(null)
    try {
      const result = await fetchRangeStats(range.startDate, range.endDate)
      // Label the single card with the preset name
      const presetLabel = PRESETS.find(p => p.key === preset)?.label ?? preset
      setMonths([{ ...result, month: presetLabel }])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load attendance data')
    } finally {
      setLoading(false)
    }
  }, [loadLast3Months])

  const applyCustomRange = useCallback(async () => {
    setCustomError(null)
    if (!customStart || !customEnd) {
      setCustomError('Please select both start and end dates')
      return
    }
    if (customStart > customEnd) {
      setCustomError('Start date must be before end date')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await fetchRangeStats(customStart, customEnd)
      setMonths([{ ...result, month: `${customStart} → ${customEnd}` }])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load attendance data')
    } finally {
      setLoading(false)
    }
  }, [customStart, customEnd])

  // Initial load
  useEffect(() => { loadLast3Months() }, [loadLast3Months])

  // ── Preset change handler ──────────────────────────────────────────────────

  const handlePresetChange = (preset: PresetKey) => {
    setActivePreset(preset)
    setShowAll(false)
    if (preset !== 'custom') loadPreset(preset)
  }

  // ── Derived: trends (only meaningful for last3Months multi-card view) ──────
  const trends: (MonthTrend | undefined)[] = months.map((m, i) =>
    i > 0 ? computeTrend(m, months[i - 1]) : undefined
  )

  // ── Visible cards ──────────────────────────────────────────────────────────
  const visibleMonths = showAll ? months : months.slice(0, 2)
  const hasMore = months.length > 2

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
      }}>
        {/* Preset buttons + module CTA */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {PRESETS.map(p => (
            <button
              key={p.key}
              onClick={() => handlePresetChange(p.key)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: activePreset === p.key ? '2px solid #1a1a1a' : '1px solid #e5e5e5',
                background: activePreset === p.key ? '#1a1a1a' : '#fff',
                color: activePreset === p.key ? '#fff' : '#374151',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {p.label}
            </button>
          ))}

          {/* CTA — same style as Financial Analytics "Open Finance module →" */}
          <a
            href="/admin/attendance"
            style={{
              marginLeft: 'auto',
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              background: '#fff',
              color: '#1a1a1a',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f5f5f5'
              e.currentTarget.style.borderColor = '#d4d4d4'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#fff'
              e.currentTarget.style.borderColor = '#e5e5e5'
            }}
          >
            Open Attendance module →
          </a>
        </div>

        {/* Custom range inputs */}
        {activePreset === 'custom' && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '14px', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>to</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              onClick={applyCustomRange}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#1a1a1a',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Apply
            </button>
            {customError && (
              <span style={{ fontSize: '12px', color: '#dc2626' }}>{customError}</span>
            )}
          </div>
        )}
      </div>

      {/* ── Loading state ─────────────────────────────────────────────────── */}
      {loading && (
        <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
          Loading attendance data...
        </div>
      )}

      {/* ── Error state ───────────────────────────────────────────────────── */}
      {!loading && error && (
        <div style={{ padding: '24px', background: '#fef2f2', borderRadius: '12px', color: '#dc2626', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {!loading && !error && months.length === 0 && (
        <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
          No attendance data found for the selected period.
        </div>
      )}

      {/* ── Month cards ───────────────────────────────────────────────────── */}
      {!loading && !error && months.length > 0 && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: hasMore ? '12px' : '24px',
          }}>
            {visibleMonths.map((m, index) => {
              const isDarkIndex = showAll ? months.length - 1 : visibleMonths.length - 1
              const isDark = index === isDarkIndex
              const textColor    = isDark ? '#fff'                    : '#1a1a1a'
              const subColor     = isDark ? '#9ca3af'                 : '#666'
              const dividerColor = isDark ? 'rgba(255,255,255,0.1)'  : '#f5f5f5'
              const trend        = trends[showAll ? index : (months.length - visibleMonths.length + index)]

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
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: textColor, marginBottom: '4px' }}>
                    {m.month}
                  </h3>
                  {m.totalWorkingDays > 0 && (
                    <div style={{ fontSize: '12px', color: subColor, marginBottom: '16px' }}>
                      {m.totalWorkingDays} working days · {m.totalEmployees} employees
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Attendance rate KPI */}
                    <div>
                      <div style={{ fontSize: '13px', color: subColor, marginBottom: '4px' }}>
                        Attendance Rate
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '32px', fontWeight: 700, color: textColor }}>
                          {m.attendanceRate}%
                        </span>
                        {trend && (
                          <TrendBadge value={trend.attendanceRate} invertColor={false} />
                        )}
                      </div>
                    </div>

                    {/* Stat grid */}
                    <StatGrid
                      stats={m}
                      textColor={textColor}
                      subColor={subColor}
                      dividerColor={dividerColor}
                      trend={trend}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* More / Less toggle */}
          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <button
                onClick={() => setShowAll(prev => !prev)}
                style={{
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#1a1a1a',
                  background: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
              >
                {showAll ? 'Show Less' : `Show All (${months.length})`}
              </button>
            </div>
          )}

          {/* ── Breakdown bars ─────────────────────────────────────────────── */}
          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '20px' }}>
              Attendance Breakdown
            </h3>

            {visibleMonths.map((m, index) => {
              /**
               * Correct denominator for breakdown bars:
               * totalEmployees × totalWorkingDays = total possible employee-days.
               *
               * We do NOT sum present+absent+late+... because LATE and HALF_DAY
               * are sub-dimensions of PRESENT (already counted in present).
               * Summing them would double-count and bars would exceed 100%.
               */
              const base = m.totalEmployees * m.totalWorkingDays
              const pct = (n: number) =>
                base > 0 ? ((n / base) * 100).toFixed(1) : '0.0'

              const bars = [
                { label: 'Present (on-site)', value: m.onsite,   color: '#16a34a' },
                { label: 'WFH',               value: m.wfh,      color: '#2563eb' },
                { label: 'Late',              value: m.late,     color: '#d97706' },
                { label: 'Half Day',          value: m.halfDay,  color: '#7c3aed' },
                { label: 'On Leave',          value: m.onLeave,  color: '#0891b2' },
                { label: 'Absent',            value: m.absent,   color: '#dc2626' },
              ]

              return (
                <div key={m.month} style={{ marginBottom: index < visibleMonths.length - 1 ? '28px' : 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '14px' }}>
                    {m.month}
                    {m.totalWorkingDays > 0 && (
                      <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 400, marginLeft: '8px' }}>
                        {m.totalEmployees} employees · {m.totalWorkingDays} working days
                        {base > 0 && ` · ${base} total employee-days`}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {bars.map(({ label, value, color }) => (
                      <div key={label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', color: '#666' }}>{label}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
                            {value}
                            {base > 0 && (
                              <span style={{ color: '#9ca3af', fontWeight: 400 }}>
                                {' '}({pct(value)}%)
                              </span>
                            )}
                          </span>
                        </div>
                        <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${base > 0 ? Math.min((value / base) * 100, 100) : 0}%`,
                            background: color,
                            borderRadius: '3px',
                            transition: 'width 0.3s ease',
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {index < visibleMonths.length - 1 && (
                    <div style={{ height: '1px', background: '#f3f4f6', marginTop: '24px' }} />
                  )}
                </div>
              )
            })}

            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                <button
                  onClick={() => setShowAll(prev => !prev)}
                  style={{
                    padding: '6px 16px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#1a1a1a',
                    background: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
                >
                  {showAll ? 'Show Less' : `Show All (${months.length})`}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default AttendanceSummaryReport
