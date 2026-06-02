import { useState, useEffect } from 'react'
import FinanceDashboard from './components/FinanceDashboard'
import IncomeTable from './components/IncomeTable'
import ExpenseTable from './components/ExpenseTable'
import ProjectProfit from './components/ProjectProfit'
import EmployeeCost from './components/EmployeeCost'
import LedgerPage from './components/LedgerPage'
import InvoicePage from './components/InvoicePage'

type ViewType = 'dashboard' | 'income' | 'expenses' | 'project-profit' | 'employee-cost' | 'ledger' | 'invoices'

const FinancePage = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const [showRevenueForm, setShowRevenueForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div
        style={isMobile ? {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '16px',
          marginBottom: '24px',
        } : {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 600, 
            marginBottom: 0,
            color: '#1a1a1a',
            letterSpacing: '-0.01em'
          }}>
            Finance Management
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', width: isMobile ? '100%' : 'auto' }}>
          {activeView === 'income' && (
            <>
              <button
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid #e5e5e5',
                  backgroundColor: '#fff',
                  color: '#1a1a1a',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  flex: isMobile ? 1 : 'none',
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
              >
                Upload Invoice
              </button>
              <button
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  flex: isMobile ? 1 : 'none',
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                onClick={() => setShowRevenueForm(true)}
              >
                + Add Income
              </button>
            </>
          )}
          {activeView === 'expenses' && (
            <button
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                flex: isMobile ? 1 : 'none',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
              onClick={() => setShowExpenseForm(true)}
            >
              + Add Expense
            </button>
          )}
          {activeView === 'dashboard' && (
            <button
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1px solid #e5e5e5',
                backgroundColor: '#fff',
                color: '#1a1a1a',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                flex: isMobile ? 1 : 'none',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              Export Report
            </button>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div style={{ 
        borderBottom: '1px solid #e5e5e5',
        marginBottom: '20px'
      }}>
        {isMobile && (
          <style>{`
            .finance-tabs-container::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        )}
        <div 
          className="finance-tabs-container"
          style={{
            display: 'flex',
            gap: '4px',
            overflowX: isMobile ? 'auto' : 'visible',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: isMobile ? '4px' : '0px',
            marginBottom: isMobile ? '-4px' : '0px',
          }}
        >
          <div style={{ display: 'flex', gap: '4px', width: isMobile ? 'auto' : '100%' }}>
            {[
              { id: 'dashboard' as ViewType, label: 'Dashboard' },
              { id: 'income' as ViewType, label: 'Income Management' },
              { id: 'expenses' as ViewType, label: 'Expense Management' },
              { id: 'project-profit' as ViewType, label: 'Project Profit' },
              { id: 'employee-cost' as ViewType, label: 'Employee Cost' },
              { id: 'ledger' as ViewType, label: 'Ledger' },
              { id: 'invoices' as ViewType, label: 'Invoices' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                style={{
                  padding: isMobile ? '12px 14px' : '12px 20px',
                  border: 'none',
                  background: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: activeView === tab.id ? '#1a1a1a' : '#666',
                  cursor: 'pointer',
                  borderBottom: activeView === tab.id ? '2px solid #1a1a1a' : '2px solid transparent',
                  transition: 'all 0.2s ease',
                  marginBottom: '-1px',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== tab.id) {
                    e.currentTarget.style.color = '#1a1a1a'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== tab.id) {
                    e.currentTarget.style.color = '#666'
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {activeView === 'dashboard' && <FinanceDashboard />}

      {activeView === 'project-profit' && <ProjectProfit />}

      {activeView === 'employee-cost' && <EmployeeCost />}

      {activeView === 'ledger' && (
        <LedgerPage />
      )}

      {activeView === 'invoices' && (
        <InvoicePage />
      )}

      {activeView === 'income' && (
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e5e5e5',
            overflow: 'hidden',
          }}
        >
          <IncomeTable
            showForm={showRevenueForm}
            onFormClose={() => setShowRevenueForm(false)}
          />
        </div>
      )}

      {activeView === 'expenses' && (
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e5e5e5',
            overflow: 'hidden',
          }}
        >
          <ExpenseTable
            showForm={showExpenseForm}
            onFormClose={() => setShowExpenseForm(false)}
          />
        </div>
      )}
    </div>
  )
}

export default FinancePage
