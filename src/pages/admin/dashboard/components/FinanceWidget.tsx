import { useEffect, useState } from 'react'
import api from '../../../../utils/api'

interface FinanceData {
  monthlyIncome: number
  monthlyExpense: number
  monthlyProfit: number
}

const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`
  }
  return `₹${amount}`
}

const FinanceWidget = () => {
  const [data, setData] = useState<FinanceData>({ monthlyIncome: 0, monthlyExpense: 0, monthlyProfit: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinanceData()
  }, [])

  const fetchFinanceData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/dashboard')
      setData({
        monthlyIncome: response.data.monthlyIncome || 0,
        monthlyExpense: response.data.monthlyExpense || 0,
        monthlyProfit: response.data.monthlyProfit || 0,
      })
    } catch (error) {
      console.error('Failed to fetch finance data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h3 className="card-title">Finance Snapshot</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="card-title">Finance Snapshot</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ 
          padding: '16px', 
          background: '#fafafa', 
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Monthly Income</div>
          <div style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a1a' }}>{formatCurrency(data.monthlyIncome)}</div>
        </div>

        <div style={{ 
          padding: '16px', 
          background: '#fafafa', 
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Monthly Expense</div>
          <div style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a1a' }}>{formatCurrency(data.monthlyExpense)}</div>
        </div>

        <div style={{ 
          padding: '16px', 
          background: '#1a1a1a', 
          borderRadius: '8px',
          marginTop: '4px'
        }}>
          <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>Net Profit</div>
          <div style={{ fontSize: '26px', fontWeight: '600', color: '#ffffff' }}>{formatCurrency(data.monthlyProfit)}</div>
        </div>
      </div>
    </div>
  )
}

export default FinanceWidget
