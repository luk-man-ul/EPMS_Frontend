import { useState } from 'react'
import AttendanceStats from './components/AttendanceStats'
import AttendanceTable from './components/AttendanceTable'
import LeaveRequests from './components/LeaveRequests'
import MonthlyReportTable from './components/MonthlyReportTable'
import AttendanceCalendar from './components/AttendanceCalendar'

type ViewType = 'daily' | 'monthly' | 'calendar'

const AttendancePage = () => {
  const [activeView, setActiveView] = useState<ViewType>('daily')
  const [filters, setFilters] = useState({ startDate: '', endDate: '', userId: '' })

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
            color: '#1a1a1a',
            letterSpacing: '-0.01em'
          }}>
            Attendance Management
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Track and manage employee attendance
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
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
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
          >
            Download Report
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
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
          >
            Mark Manual Entry
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div style={{ 
        borderBottom: '1px solid #e5e5e5',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'daily' as ViewType, label: 'Daily View' },
            { id: 'monthly' as ViewType, label: 'Monthly Report' },
            { id: 'calendar' as ViewType, label: 'Calendar View' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: 'none',
                fontSize: '14px',
                fontWeight: 500,
                color: activeView === tab.id ? '#1a1a1a' : '#666',
                cursor: 'pointer',
                borderBottom: activeView === tab.id ? '2px solid #1a1a1a' : '2px solid transparent',
                transition: 'all 0.2s ease',
                marginBottom: '-1px'
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

      {/* Content */}
      {activeView === 'daily' && (
        <>
          {/* Date Filter Bar */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e5e5e5',
            padding: '16px 24px',
            marginBottom: '24px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#666' }}>
              Start Date:
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#666' }}>
              End Date:
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            <button
              onClick={() => setFilters({ startDate: '', endDate: '', userId: '' })}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                backgroundColor: '#fff',
                color: '#666',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                marginLeft: 'auto',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fafafa'
                e.currentTarget.style.color = '#1a1a1a'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff'
                e.currentTarget.style.color = '#666'
              }}
            >
              Clear Filters
            </button>
          </div>

          <AttendanceStats filters={filters} />
          <LeaveRequests />
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e5e5',
              overflow: 'hidden',
            }}
          >
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '1px solid #e5e5e5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
                Today's Attendance - February 10, 2026
              </h3>
              <input
                type="text"
                placeholder="Search employees..."
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e5e5',
                  fontSize: '14px',
                  outline: 'none',
                  width: '240px'
                }}
              />
            </div>
            <AttendanceTable />
          </div>
        </>
      )}

      {activeView === 'monthly' && (
        <>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '24px',
            alignItems: 'center'
          }}>
            <select
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                background: '#fff',
                fontSize: '14px',
                color: '#1a1a1a',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option>All Employees</option>
              <option>Engineering</option>
              <option>Design</option>
              <option>QA</option>
              <option>Marketing</option>
            </select>
            <select
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                background: '#fff',
                fontSize: '14px',
                color: '#1a1a1a',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option>February 2026</option>
              <option>January 2026</option>
              <option>December 2025</option>
            </select>
          </div>
          <MonthlyReportTable />
        </>
      )}

      {activeView === 'calendar' && (
        <>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '24px',
            alignItems: 'center'
          }}>
            <select
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
                background: '#fff',
                fontSize: '14px',
                color: '#1a1a1a',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option>Select Employee</option>
              <option>Sarah Johnson</option>
              <option>Michael Chen</option>
              <option>Emily Rodriguez</option>
              <option>David Kumar</option>
            </select>
          </div>
          <AttendanceCalendar />
        </>
      )}
    </div>
  )
}

export default AttendancePage
