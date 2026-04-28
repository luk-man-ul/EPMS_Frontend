const ProfitLossReport = () => {
  return (
    <div style={{
      padding: '48px 32px',
      textAlign: 'center',
      background: '#fff',
      border: '1px solid #e5e5e5',
      borderRadius: '12px',
    }}>
      <div style={{ fontSize: '32px', marginBottom: '16px' }}>📈</div>
      <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
        Profit & Loss
      </div>
      <div style={{ fontSize: '14px', color: '#666', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>
        Profit and loss data is available in the{' '}
        <a href="/admin/finance" style={{ color: '#1a1a1a', fontWeight: 600 }}>Finance module</a>.
        Use the Dashboard tab for a live summary and Project Profit tab for per-project breakdown.
      </div>
    </div>
  )
}

export default ProfitLossReport
