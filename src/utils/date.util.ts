/**
 * Date utilities for IST-safe rendering.
 *
 * Key rule:
 *   - `date` fields from the backend are YYYY-MM-DD strings (@db.Date).
 *     Parse them with a noon anchor (T12:00:00) so no timezone shift occurs.
 *   - `firstCheckIn`, `lastCheckOut`, `checkIn`, `checkOut` are full ISO
 *     DateTime strings — parse them directly with new Date().
 */

/**
 * Format a Date object as YYYY-MM-DD using the browser's LOCAL timezone.
 *
 * NEVER use date.toISOString().split('T')[0] — that returns the UTC date,
 * which shifts one day backward for IST users after 18:30 UTC (midnight IST).
 *
 * Use this whenever you need to convert a Date → YYYY-MM-DD string for
 * API params, filter values, or date comparisons.
 */
export function formatLocalDate(date: Date): string {
  return (
    `${date.getFullYear()}-` +
    `${String(date.getMonth() + 1).padStart(2, '0')}-` +
    `${String(date.getDate()).padStart(2, '0')}`
  );
}

/**
 * Format a YYYY-MM-DD date string for display.
 * Uses T12:00:00 anchor to prevent UTC-to-local day shift.
 */
export function formatISTDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    // Anchor at noon so no timezone can shift the date to the previous day
    const d = new Date(dateStr.length === 10 ? `${dateStr}T12:00:00` : dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

/**
 * Format a full ISO DateTime string as a time (e.g. "09:15 AM").
 */
export function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '—';
  }
}

/**
 * Format a full ISO DateTime string as a full date+time.
 */
export function formatISTDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-IN');
  } catch {
    return '—';
  }
}

/**
 * Get today's date as a YYYY-MM-DD string in local time (not UTC).
 * Use this instead of new Date().toISOString().split('T')[0].
 */
export function todayLocalDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Get a date N days ago as a YYYY-MM-DD string in local time.
 */
export function daysAgoLocalDateStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
