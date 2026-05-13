import { useState } from 'react'
import ReportFilters from './components/ReportFilters'
import ProjectPerformanceReport from './components/ProjectPerformanceReport'
import EmployeeProductivityReport from './components/EmployeeProductivityReport'
import AttendanceSummaryReport from './components/AttendanceSummaryReport'
import FinancialAnalyticsReport from './components/FinancialReport'
import type { ReportCategory } from './types/report.types'

const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState<ReportCategory>('PROJECT_PERFORMANCE')

  const reports = [
    { id: 'PROJECT_PERFORMANCE'  as ReportCategory, label: 'Project Performance',   icon: '📊' },
    { id: 'EMPLOYEE_PRODUCTIVITY' as ReportCategory, label: 'Employee Productivity', icon: '👥' },
    { id: 'ATTENDANCE_SUMMARY'   as ReportCategory, label: 'Attendance Summary',    icon: '📅' },
    { id: 'FINANCIAL_ANALYTICS'  as ReportCategory, label: 'Financial Analytics',   icon: '💰' },
  ]

  return (
    <div style={{ width: '100%' }}>
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
            color: '#1a1a1a',
            letterSpacing: '-0.01em'
          }}>
            Reports & Analytics
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
      <ReportFilters onFilterChange={() => {}} />

      {/* Report Content */}
      <div>
        {activeReport === 'PROJECT_PERFORMANCE'   && <ProjectPerformanceReport />}
        {activeReport === 'EMPLOYEE_PRODUCTIVITY' && <EmployeeProductivityReport />}
        {activeReport === 'ATTENDANCE_SUMMARY'    && <AttendanceSummaryReport />}
        {activeReport === 'FINANCIAL_ANALYTICS'   && <FinancialAnalyticsReport />}
      </div>
    </div>
  )
}

export default ReportsPage
