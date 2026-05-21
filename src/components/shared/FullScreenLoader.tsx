import { useEffect, useState } from 'react'

interface FullScreenLoaderProps {
  /** Primary message shown immediately */
  message?: string
  /**
   * Seconds before the slow-backend hint appears.
   * Pass 0 to disable. Default: 9
   */
  slowThreshold?: number
}

/**
 * FullScreenLoader
 *
 * Shown during auth bootstrap (silentRefresh / token restoration).
 * Replaces the blank white screen that appeared while AuthContext
 * resolved the refresh-token cookie on hard reload.
 *
 * Design: minimal enterprise ERP style — matches the existing
 * #fafafa / #1a1a1a / Inter theme used throughout the app.
 */
export function FullScreenLoader({
  message = 'Restoring your session…',
  slowThreshold = 9,
}: FullScreenLoaderProps) {
  const [showSlowHint, setShowSlowHint] = useState(false)

  useEffect(() => {
    if (!slowThreshold) return
    const t = setTimeout(() => setShowSlowHint(true), slowThreshold * 1000)
    return () => clearTimeout(t)
  }, [slowThreshold])

  return (
    <div style={styles.overlay} role="status" aria-live="polite" aria-label={message}>
      <div style={styles.card}>

        {/* ── Brand mark ─────────────────────────────────────── */}
        <div style={styles.logoWrap}>
          <div style={styles.logoBox}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M5 8h18M5 14h18M5 20h11"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span style={styles.brandName}>ERP</span>
        </div>

        {/* ── Spinner ────────────────────────────────────────── */}
        <div style={styles.spinnerTrack} aria-hidden="true">
          <div style={styles.spinnerArc} />
        </div>

        {/* ── Status text ────────────────────────────────────── */}
        <p style={styles.message}>{message}</p>

        {/* ── Slow-backend hint (appears after threshold) ────── */}
        <p
          style={{
            ...styles.hint,
            opacity: showSlowHint ? 1 : 0,
            transform: showSlowHint ? 'translateY(0)' : 'translateY(4px)',
          }}
          aria-hidden={!showSlowHint}
        >
          Server is taking longer than expected — waking up backend services…
        </p>
      </div>

      {/* Keyframe injection — scoped to this component */}
      <style>{`
        @keyframes erp-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes erp-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
// Inline styles keep the component self-contained — no CSS file dependency,
// no class-name collisions, works regardless of CSS load order.

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position:       'fixed',
    inset:          0,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    background:     '#fafafa',
    zIndex:         9999,
    animation:      'erp-fade-in 0.2s ease both',
  },

  card: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    gap:            '20px',
    padding:        '48px 40px',
    background:     '#ffffff',
    borderRadius:   '20px',
    border:         '1px solid #ebebeb',
    boxShadow:      '0 4px 32px rgba(0, 0, 0, 0.06)',
    minWidth:       '300px',
    maxWidth:       '380px',
    width:          '90vw',
  },

  logoWrap: {
    display:    'flex',
    alignItems: 'center',
    gap:        '10px',
  },

  logoBox: {
    width:          '44px',
    height:         '44px',
    borderRadius:   '12px',
    background:     'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    boxShadow:      '0 4px 14px rgba(102, 126, 234, 0.35)',
    flexShrink:     0,
  },

  brandName: {
    fontSize:   '22px',
    fontWeight: 700,
    color:      '#1a1a1a',
    letterSpacing: '-0.01em',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif",
  },

  spinnerTrack: {
    width:        '40px',
    height:       '40px',
    borderRadius: '50%',
    border:       '3px solid #ebebeb',
    position:     'relative',
    flexShrink:   0,
  },

  spinnerArc: {
    position:     'absolute',
    inset:        '-3px',
    borderRadius: '50%',
    border:       '3px solid transparent',
    borderTopColor: '#667eea',
    animation:    'erp-spin 0.75s linear infinite',
  },

  message: {
    margin:     0,
    fontSize:   '14px',
    fontWeight: 500,
    color:      '#555555',
    textAlign:  'center',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif",
  },

  hint: {
    margin:     0,
    fontSize:   '12px',
    color:      '#999999',
    textAlign:  'center',
    maxWidth:   '260px',
    lineHeight: '1.5',
    transition: 'opacity 0.4s ease, transform 0.4s ease',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif",
  },
}
