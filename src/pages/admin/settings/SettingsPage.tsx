import { useState } from 'react'
import CompanySettings from './components/CompanySettings'
import RolePermissionSettings from './components/RolePermissionSettings'
import SystemSettings from './components/SystemSettings'

type SettingsTab = 'company' | 'roles' | 'system'

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company')

  const tabs = [
    { id: 'company' as SettingsTab, label: 'Company Settings', icon: '🏢' },
    { id: 'roles' as SettingsTab, label: 'Roles & Permissions', icon: '🔐' },
    { id: 'system' as SettingsTab, label: 'System Settings', icon: '⚙️' }
  ]

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 600, 
          marginBottom: 0,
          color: '#de1515ff',
          letterSpacing: '-0.01em'
        }}>
          Settings (MOCK DATA)
        </h1>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
        borderBottom: '1px solid #e5e5e5',
        paddingBottom: '0'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              fontSize: '14px',
              fontWeight: 500,
              color: activeTab === tab.id ? '#1a1a1a' : '#666',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid #1a1a1a' : '2px solid transparent',
              transition: 'all 0.2s ease',
              marginBottom: '-1px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#1a1a1a'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#666'
              }
            }}
          >
            <span style={{ fontSize: '18px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'company' && <CompanySettings />}
        {activeTab === 'roles' && <RolePermissionSettings />}
        {activeTab === 'system' && <SystemSettings />}
      </div>
    </div>
  )
}

export default SettingsPage
