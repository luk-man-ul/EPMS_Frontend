import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'

// ── Mock Data ────────────────────────────────────────────────────────────────

const SUMMARY = {
  totalBudget: 120000,
  totalExpenses: 74500,
  netProfit: 45500,
  profitPercent: 37.9,
}

const BAR_DATA = [
  { month: 'Jan', Budget: 20000, Expenses: 12000 },
  { month: 'Feb', Budget: 20000, Expenses: 15000 },
  { month: 'Mar', Budget: 20000, Expenses: 18000 },
  { month: 'Apr', Budget: 20000, Expenses: 14500 },
  { month: 'May', Budget: 20000, Expenses: 10000 },
  { month: 'Jun', Budget: 20000, Expenses: 5000 },
]

const LINE_DATA = [
  { month: 'Jan', Profit: 8000 },
  { month: 'Feb', Profit: 5000 },
  { month: 'Mar', Profit: 2000 },
  { month: 'Apr', Profit: 5500 },
  { month: 'May', Profit: 10000 },
  { month: 'Jun', Profit: 15000 },
]

const BUDGET_ALLOC = [
  { name: 'Development', value: 50000 },
  { name: 'Design', value: 25000 },
  { name: 'Marketing', value: 20000 },
  { name: 'Operations', value: 25000 },
]

const EXPENSE_BREAKDOWN = [
  { name: 'Salaries', value: 40000 },
  { name: 'Tools', value: 12000 },
  { name: 'Marketing', value: 14000 },
  { name: 'Misc', value: 8500 },
]

const PIE_COLORS = ['#667eea', '#764ba2', '#10b981', '#f59e0b']

const TRANSACTIONS = [
  { date: 'Apr 25, 2026', title: 'Developer Salaries', type: 'Expense', amount: -18000, status: 'Paid' },
  { date: 'Apr 20, 2026', title: 'Client Payment Q1', type: 'Income', amount: 35000, status: 'Received' },
  { date: 'Apr 15, 2026', title: 'Design Tools License', type: 'Expense', amount: -1200, status: 'Paid' },
  { date: 'Apr 10, 2026', title: 'Marketing Campaign', type: 'Expense', amount: -5000, status: 'Pending' },
  { date: 'Apr 5, 2026', title: 'Consulting Fee', type: 'Income', amount: 8000, status: 'Received' },
  { date: 'Mar 28, 2026', title: 'Cloud Infrastructure', type: 'Expense', amount: -2300, status: 'Paid' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.abs(n))

// ── Sub-components ────────────────────────────────────────────────────────────

const SummaryCard = ({
  icon, label, value, color, bg,
}: { icon: string; label: string; value: string; color: string; bg: string }) => (
  <div style={{
    background: bg, borderRadius: '14px', padding: '20px 24px',
    border: '1px solid transparent', flex: 1, minWidth: '180px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
      <span style={{ fontSize: '12px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <span style={{ fontSize: '20px' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '26px', fontWeight: 700, color }}>{value}</div>
  </div>
)

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{
    background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb',
    padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }}>
    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>{title}</h3>
    {children}
  </div>
)

// ── Main Component ────────────────────────────────────────────────────────────

const ProjectFinanceTab = () => {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>From</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>To</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none' }} />
          </div>
          {(fromDate || toDate) && (
            <button onClick={() => { setFromDate(''); setToDate('') }}
              style={{ marginTop: '18px', padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '13px', color: '#6b7280', cursor: 'pointer' }}>
              Clear
            </button>
          )}
        </div>
        <button style={{
          padding: '10px 18px', borderRadius: '10px', border: 'none',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
        }}>
          + Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <SummaryCard icon="💰" label="Total Budget"   value={fmt(SUMMARY.totalBudget)}   color="#1d4ed8" bg="#eff6ff" />
        <SummaryCard icon="📤" label="Total Expenses" value={fmt(SUMMARY.totalExpenses)} color="#dc2626" bg="#fef2f2" />
        <SummaryCard icon="📈" label="Net Profit"     value={fmt(SUMMARY.netProfit)}     color="#16a34a" bg="#f0fdf4" />
        <SummaryCard icon="%" label="Profit %"        value={`${SUMMARY.profitPercent}%`} color="#7c3aed" bg="#f5f3ff" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <ChartCard title="Budget vs Expenses">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={BAR_DATA} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v / 1000}k`} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Legend />
              <Bar dataKey="Budget"   fill="#667eea" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Profit Trend">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={LINE_DATA} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v / 1000}k`} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Line type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Breakdown Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        <ChartCard title="Budget Allocation">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <PieChart width={160} height={160}>
              <Pie data={BUDGET_ALLOC} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {BUDGET_ALLOC.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
            </PieChart>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {BUDGET_ALLOC.map((item, i) => (
                <div key={item.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], display: 'inline-block' }} />
                      {item.name}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{fmt(item.value)}</span>
                  </div>
                  <div style={{ height: '4px', background: '#f3f4f6', borderRadius: '4px' }}>
                    <div style={{ height: '100%', width: `${(item.value / SUMMARY.totalBudget) * 100}%`, background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Expense Breakdown">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <PieChart width={160} height={160}>
              <Pie data={EXPENSE_BREAKDOWN} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {EXPENSE_BREAKDOWN.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
            </PieChart>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {EXPENSE_BREAKDOWN.map((item, i) => (
                <div key={item.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], display: 'inline-block' }} />
                      {item.name}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{fmt(item.value)}</span>
                  </div>
                  <div style={{ height: '4px', background: '#f3f4f6', borderRadius: '4px' }}>
                    <div style={{ height: '100%', width: `${(item.value / SUMMARY.totalExpenses) * 100}%`, background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Transactions Table */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>Transactions</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Date', 'Title', 'Type', 'Amount', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f3f4f6' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((tx, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b7280' }}>{tx.date}</td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 500, color: '#111827' }}>{tx.title}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                      background: tx.type === 'Income' ? '#d1fae5' : '#fee2e2',
                      color: tx.type === 'Income' ? '#065f46' : '#991b1b',
                    }}>{tx.type}</span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 700, color: tx.amount > 0 ? '#16a34a' : '#dc2626' }}>
                    {tx.amount > 0 ? '+' : '-'}{fmt(tx.amount)}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                      background: tx.status === 'Received' ? '#d1fae5' : tx.status === 'Paid' ? '#f3f4f6' : '#fef3c7',
                      color: tx.status === 'Received' ? '#065f46' : tx.status === 'Paid' ? '#374151' : '#92400e',
                    }}>{tx.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ProjectFinanceTab
