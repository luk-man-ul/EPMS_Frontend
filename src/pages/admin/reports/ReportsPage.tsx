import { useState } from 'react'
import ReportFilters from './components/ReportFilters'
import ProjectPerformanceReport from './components/ProjectPerformanceReport'
import EmployeeProductivityReport from './components/EmployeeProductivityReport'
import AttendanceSummaryReport from './components/AttendanceSummaryReport'
import FinancialReport from './components/FinancialReport'
import ProfitLossReport from './components/ProfitLossReport'
import type { ReportCategory } from './types/report.types'

const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState<ReportCategory>('PROJECT_PERFORMANCE')
  const [filters, setFilters] = useState({})

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters })
  }

  const reports = [
    { id: 'PROJECT_PERFORMANCE' as ReportCategory, label: 'Project Performance', icon: '📊' },
    { id: 'EMPLOYEE_PRODUCTIVITY' as ReportCategory, label: 'Employee Productivity', icon: '👥' },
    { id: 'ATTENDANCE_SUMMARY' as ReportCategory, label: 'Attendance Summary', icon: '📅' },
    { id: 'FINANCIAL_REPORTS' as ReportCategory, label: 'Financial Reports', icon: '💰' },
    { id: 'PROFIT_LOSS' as ReportCategory, label: 'Profit & Loss', icon: '📈' }
  ]

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
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
            marginBottom: 4,
            color: '#f21010ff',
            letterSpacing: '-0.01em'
          }}>
            Reports & Analytics (MOCK DATA)
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Comprehensive insights and performance metrics
          </p>
        </div>
      </div>

      {/* Report Category Selector */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {reports.map(report => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id)}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: activeReport === report.id ? '2px solid #1a1a1a' : '1px solid #e5e5e5',
              background: activeReport === report.id ? '#fafafa' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (activeReport !== report.id) {
                e.currentTarget.style.backgroundColor = '#fafafa'
                e.currentTarget.style.borderColor = '#d4d4d4'
              }
            }}
            onMouseLeave={(e) => {
              if (activeReport !== report.id) {
                e.currentTarget.style.backgroundColor = '#fff'
                e.currentTarget.style.borderColor = '#e5e5e5'
              }
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              {report.icon}
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 500, 
              color: activeReport === report.id ? '#1a1a1a' : '#666'
            }}>
              {report.label}
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <ReportFilters onFilterChange={handleFilterChange} />

      {/* Report Content */}
      <div>
        {activeReport === 'PROJECT_PERFORMANCE' && <ProjectPerformanceReport />}
        {activeReport === 'EMPLOYEE_PRODUCTIVITY' && <EmployeeProductivityReport />}
        {activeReport === 'ATTENDANCE_SUMMARY' && <AttendanceSummaryReport />}
        {activeReport === 'FINANCIAL_REPORTS' && <FinancialReport />}
        {activeReport === 'PROFIT_LOSS' && <ProfitLossReport />}
      </div>
    </div>
  )
}

export default ReportsPage
