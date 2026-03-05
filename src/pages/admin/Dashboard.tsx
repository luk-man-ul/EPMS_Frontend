import { PendingApprovalsDashboard, SelfWorkMetricsDashboard } from '../../components/shared'

const Dashboard = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      <div style={{ marginTop: '24px' }}>
        <PendingApprovalsDashboard />
      </div>
      
      <div style={{ marginTop: '24px' }}>
        <SelfWorkMetricsDashboard />
      </div>
    </div>
  )
}

export default Dashboard
