/**
 * FinanceStatCard — shared stat card for the Finance module.
 * Matches the existing visual language used in FinanceDashboard,
 * ProjectProfit, and EmployeeCost.
 */

interface FinanceStatCardProps {
  label: string
  value: string
  subtext?: string
  /** Background color. Defaults to '#fff' (light card). */
  bgColor?: string
  /** Text color for the value. Defaults to '#1a1a1a' on light, '#fff' on dark. */
  valueColor?: string
  /** When true, value renders in red (negative balance). */
  isNegative?: boolean
}

const FinanceStatCard = ({
  label,
  value,
  subtext,
  bgColor = '#fff',
  valueColor,
  isNegative = false,
}: FinanceStatCardProps) => {
  const isDark = bgColor !== '#fff'

  const resolvedValueColor = valueColor
    ?? (isNegative ? '#dc2626' : isDark ? '#fff' : '#1a1a1a')

  const labelColor = isDark ? 'rgba(255,255,255,0.6)' : '#666'
  const subtextColor = isDark ? 'rgba(255,255,255,0.4)' : '#999'
  const borderStyle = isDark ? 'none' : '1px solid #e5e5e5'

  return (
    <div
      style={{
        background: bgColor,
        border: borderStyle,
        borderRadius: '12px',
        padding: '24px',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!isDark) {
          e.currentTarget.style.borderColor = '#d4d4d4'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isDark) {
          e.currentTarget.style.borderColor = '#e5e5e5'
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
    >
      <div style={{ fontSize: '13px', color: labelColor, marginBottom: '8px' }}>
        {label}
      </div>
      <div
        style={{
          fontSize: '32px',
          fontWeight: 600,
          color: resolvedValueColor,
          letterSpacing: '-0.02em',
          marginBottom: subtext ? '8px' : 0,
        }}
      >
        {value}
      </div>
      {subtext && (
        <div style={{ fontSize: '12px', color: subtextColor }}>
          {subtext}
        </div>
      )}
    </div>
  )
}

export default FinanceStatCard
