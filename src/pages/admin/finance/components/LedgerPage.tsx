import { useState, useEffect, useMemo } from 'react'
import { getLedgerEntries } from '../finance.api'
import type { LedgerEntry, LedgerEntryType, LedgerReferenceType } from '../types/finance.types'
import { formatCurrency, formatDate } from '../finance.utils'

// ── Shared styles ─────────────────────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
  padding: '9px 14px',
  borderRadius: '8px',
  border: '1px solid #e5e5e5',
  background: '#fff',
  fontSize: '13px',
  color: '#1a1a1a',
  cursor: 'pointer',
  outline: 'none',
}

const inputStyle: React.CSSProperties = {
  padding: '9px 14px',
  borderRadius: '8px',
  border: '1px solid #e5e5e5',
  fontSize: '13px',
  outline: 'none',
  color: '#1a1a1a',
  background: '#fff',
}

// ── Sub-components ────────────────────────────────────────────────────────────

const TypeBadge = ({ type }: { type: LedgerEntryType }) => (
  <span style={{
    padding: '3px 9px',
    borderRadius: '5px',
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-block',
    background: type === 'CREDIT' ? '#f0fdf4' : '#fff5f5',
    color:      type === 'CREDIT' ? '#16a34a' : '#dc2626',
  }}>
    {type}
  </span>
)

const RefBadge = ({ refType }: { refType: LedgerReferenceType }) => (
  <span style={{
    padding: '3px 9px',
    borderRadius: '5px',
    fontSize: '12px',
    fontWeight: 500,
    display: 'inline-block',
    background: refType === 'REVENUE' ? '#eff6ff' : '#faf5ff',
    color:      refType === 'REVENUE' ? '#2563eb' : '#7c3aed',
  }}>
    {refType}
  </span>
)

const PaymentBadge = ({ method }: { method?: string | null }) => {
  if (!method) return <span style={{ color: '#bbb', fontSize: '13px' }}>—</span>
  return (
    <span style={{
      padding: '3px 8px',
      borderRadius: '5px',
      fontSize: '12px',
      fontWeight: 600,
      background: method === 'ONLINE' ? '#eff6ff' : '#f5f5f5',
      color:      method === 'ONLINE' ? '#2563eb' : '#555',
      display: 'inline-block',
    }}>
      {method}
    </span>
  )
}

// ── Summary bar ───────────────────────────────────────────────────────────────

interface SummaryBarProps {
  entries: LedgerEntry[]
  isMobile: boolean
}

const SummaryBar = ({ entries, isMobile }: SummaryBarProps) => {
  const totalCredit = entries
    .filter((e) => e.type === 'CREDIT')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalDebit = entries
    .filter((e) => e.type === 'DEBIT')
    .reduce((sum, e) => sum + e.amount, 0)

  const balance = totalCredit - totalDebit

  const card = (label: string, value: number, color: string, bg: string) => (
    <div style={{
      padding: '16px 24px',
      borderRadius: '10px',
      background: bg,
      border: '1px solid #e5e5e5',
      flex: isMobile ? 'none' : 1,
      minWidth: '180px',
    }}>
      <div style={{ fontSize: '12px', color: '#666', fontWeight: 500, marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color }}>{formatCurrency(value)}</div>
    </div>
  )

  return (
    <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' } : { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
      {card('Total Credits', totalCredit, '#16a34a', '#f0fdf4')}
      {card('Total Debits',  totalDebit,  '#dc2626', '#fff5f5')}
      <div style={{
        padding: '16px 24px',
        borderRadius: '10px',
        background: balance >= 0 ? '#f8fafc' : '#fff5f5',
        border: `1px solid ${balance >= 0 ? '#e5e5e5' : '#fecaca'}`,
        flex: isMobile ? 'none' : 1,
        minWidth: '180px',
      }}>
        <div style={{ fontSize: '12px', color: '#666', fontWeight: 500, marginBottom: '6px' }}>Net Balance</div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: balance >= 0 ? '#1a1a1a' : '#dc2626' }}>
          {formatCurrency(Math.abs(balance))}
          {balance < 0 && <span style={{ fontSize: '13px', marginLeft: '4px', fontWeight: 500 }}>deficit</span>}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const LedgerPage = () => {
  // ── Data state ──────────────────────────────────────────
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Filter state ────────────────────────────────────────
  const [filterType, setFilterType]      = useState<'' | LedgerEntryType>('')
  const [filterRef,  setFilterRef]       = useState<'' | LedgerReferenceType>('')
  const [startDate,  setStartDate]       = useState('')
  const [endDate,    setEndDate]         = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ── Fetch ───────────────────────────────────────────────
  const fetchLedger = () => {
    setLoading(true)
    setError(null)
    getLedgerEntries({
      type:          filterType   || undefined,
      referenceType: filterRef    || undefined,
      startDate:     startDate    || undefined,
      endDate:       endDate      || undefined,
    })
      .then(setEntries)
      .catch((err: any) => setError(err.response?.data?.message || 'Failed to load ledger'))
      .finally(() => setLoading(false))
  }

  // Fetch on mount and whenever filters change
  useEffect(() => { fetchLedger() }, [filterType, filterRef, startDate, endDate]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Running balance (computed front-end, newest-first from API) ─────────────
  // The API returns entries newest-first. To compute a meaningful running
  // balance we reverse to oldest-first, accumulate, then reverse back so the
  // table still shows newest first with the correct cumulative balance.
  const entriesWithBalance = useMemo(() => {
    const chronological = [...entries].reverse()
    let running = 0
    const withBal = chronological.map((entry) => {
      running += entry.type === 'CREDIT' ? entry.amount : -entry.amount
      return { ...entry, runningBalance: running }
    })
    return withBal.reverse() // back to newest-first for display
  }, [entries])

  // ── Render ──────────────────────────────────────────────
  return (
    <div>
      {/* ── Summary bar ── */}
      {!loading && !error && entries.length > 0 && (
        <SummaryBar entries={entries} isMobile={isMobile} />
      )}

      {/* ── Filters ── */}
      <div style={isMobile ? {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '20px',
      } : {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Transaction type */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as '' | LedgerEntryType)}
          style={{ ...selectStyle, width: isMobile ? '100%' : 'auto' }}
        >
          <option value="">All Types</option>
          <option value="CREDIT">Credit</option>
          <option value="DEBIT">Debit</option>
        </select>

        {/* Reference type */}
        <select
          value={filterRef}
          onChange={(e) => setFilterRef(e.target.value as '' | LedgerReferenceType)}
          style={{ ...selectStyle, width: isMobile ? '100%' : 'auto' }}
        >
          <option value="">All References</option>
          <option value="REVENUE">Revenue</option>
          <option value="EXPENSE">Expense</option>
        </select>

        {/* Date range */}
        <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: '8px' } : { display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: isMobile ? '100%' : 'auto' }}>
            <span style={{ fontSize: '13px', color: '#666', width: isMobile ? '40px' : 'auto' }}>From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: isMobile ? '100%' : 'auto' }}>
            <span style={{ fontSize: '13px', color: '#666', width: isMobile ? '40px' : 'auto' }}>To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Clear filters */}
        {(filterType || filterRef || startDate || endDate) && (
          <button
            onClick={() => { setFilterType(''); setFilterRef(''); setStartDate(''); setEndDate('') }}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              background: '#fff',
              fontSize: '13px',
              color: '#666',
              cursor: 'pointer',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            Clear filters
          </button>
        )}

        {/* Entry count */}
        {!loading && !error && (
          <span style={{ marginLeft: isMobile ? '0' : 'auto', fontSize: '13px', color: '#999', marginTop: isMobile ? '4px' : '0' }}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
            Loading ledger...
          </div>
        ) : error ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>
            {error}
          </div>
        ) : entries.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📒</div>
            <div style={{ fontSize: '15px', fontWeight: 500, color: '#1a1a1a', marginBottom: '6px' }}>
              No ledger entries yet
            </div>
            <div style={{ fontSize: '13px', color: '#999' }}>
              Entries are created automatically when revenue or expense records are added.
            </div>
          </div>
        ) : isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {entriesWithBalance.map((entry, idx) => {
              const isCredit = entry.type === 'CREDIT'
              const balanceNegative = entry.runningBalance < 0

              return (
                <div
                  key={entry.id}
                  style={{
                    padding: '16px',
                    borderBottom: idx < entriesWithBalance.length - 1 ? '1px solid #e5e5e5' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        <TypeBadge type={entry.type} />
                        <RefBadge refType={entry.referenceType} />
                        {entry.category && (
                          <span style={{ fontSize: '11px', color: '#666', background: '#fafafa', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e5e5e5' }}>
                            {entry.category.name}
                          </span>
                        )}
                        <span style={{ fontSize: '12px', color: '#999' }}>
                          📅 {formatDate(entry.date)}
                        </span>
                      </div>

                      {entry.description && (
                        <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.4, marginTop: '2px' }}>
                          {entry.description}
                        </div>
                      )}

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                        {entry.paymentMethod && (
                          <span style={{ fontSize: '11px', fontWeight: 500, color: '#555', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                            💳 {entry.paymentMethod} {entry.bankAccount ? `(${entry.bankAccount.name})` : ''}
                          </span>
                        )}
                        <span style={{ fontSize: '11px', color: '#999' }}>
                          By {entry.createdBy.firstName} {entry.createdBy.lastName}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: isCredit ? '#16a34a' : '#dc2626' }}>
                        {isCredit ? '+' : '-'}{formatCurrency(entry.amount)}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: balanceNegative ? '#dc2626' : '#1a1a1a', background: '#f8fafc', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e5e5e5' }}>
                        Bal: {balanceNegative && '−'}{formatCurrency(Math.abs(entry.runningBalance))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{
                  textAlign: 'left',
                  fontSize: '12px',
                  color: '#666',
                  fontWeight: 500,
                  borderBottom: '1px solid #e5e5e5',
                  background: '#fafafa',
                }}>
                  <th style={{ padding: '14px 20px', fontWeight: 500 }}>Date</th>
                  <th style={{ padding: '14px 20px', fontWeight: 500 }}>Type</th>
                  <th style={{ padding: '14px 20px', fontWeight: 500 }}>Reference</th>
                  <th style={{ padding: '14px 20px', fontWeight: 500 }}>Description</th>
                  <th style={{ padding: '14px 20px', fontWeight: 500 }}>Payment</th>
                  <th style={{ padding: '14px 20px', fontWeight: 500, textAlign: 'right', color: '#16a34a' }}>Credit</th>
                  <th style={{ padding: '14px 20px', fontWeight: 500, textAlign: 'right', color: '#dc2626' }}>Debit</th>
                  <th style={{ padding: '14px 20px', fontWeight: 500, textAlign: 'right' }}>Balance</th>
                  <th style={{ padding: '14px 20px', fontWeight: 500 }}>By</th>
                </tr>
              </thead>
              <tbody>
                {entriesWithBalance.map((entry) => {
                  const isCredit = entry.type === 'CREDIT'
                  const balanceNegative = entry.runningBalance < 0

                  return (
                    <tr
                      key={entry.id}
                      style={{ borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s ease', backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Date */}
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#1a1a1a', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {formatDate(entry.date)}
                      </td>

                      {/* Type badge */}
                      <td style={{ padding: '14px 20px' }}>
                        <TypeBadge type={entry.type} />
                      </td>

                      {/* Reference type badge */}
                      <td style={{ padding: '14px 20px' }}>
                        <RefBadge refType={entry.referenceType} />
                        {entry.category && (
                          <div style={{ fontSize: '11px', color: '#999', marginTop: '3px' }}>
                            {entry.category.name}
                          </div>
                        )}
                      </td>

                      {/* Description */}
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#666', maxWidth: '220px' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {entry.description || '—'}
                        </span>
                      </td>

                      {/* Payment method + bank */}
                      <td style={{ padding: '14px 20px' }}>
                        <PaymentBadge method={entry.paymentMethod} />
                        {entry.bankAccount && (
                          <div style={{ fontSize: '11px', color: '#999', marginTop: '3px' }}>
                            {entry.bankAccount.name}
                          </div>
                        )}
                      </td>

                      {/* Credit */}
                      <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 600, fontSize: '14px', color: isCredit ? '#16a34a' : '#ccc' }}>
                        {isCredit ? formatCurrency(entry.amount) : '—'}
                      </td>

                      {/* Debit */}
                      <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 600, fontSize: '14px', color: !isCredit ? '#dc2626' : '#ccc' }}>
                        {!isCredit ? formatCurrency(entry.amount) : '—'}
                      </td>

                      {/* Running balance */}
                      <td style={{
                        padding: '14px 20px',
                        textAlign: 'right',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: balanceNegative ? '#dc2626' : '#1a1a1a',
                        whiteSpace: 'nowrap',
                      }}>
                        {balanceNegative && '−'}{formatCurrency(Math.abs(entry.runningBalance))}
                      </td>

                      {/* Created by */}
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#666', whiteSpace: 'nowrap' }}>
                        {entry.createdBy.firstName} {entry.createdBy.lastName}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default LedgerPage
