import { Route, Navigate } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import ProtectedRoute from '../components/ProtectedRoute'

import TeamLeadDashboard from '../pages/TeamLead/Dashboard'
import TeamLeadProjects from '../pages/TeamLead/Projects'
import TeamLeadProjectDetail from '../pages/TeamLead/projects/detail/ProjectDetailPage'
import TeamLeadTasks from '../pages/TeamLead/Tasks'
import TeamLeadTaskDetail from '../pages/TeamLead/tasks/detail/TaskDetailPage'
import TeamLeadTickets from '../pages/TeamLead/Tickets'
import TeamLeadWorkApproval from '../pages/TeamLead/WorkApproval'
import TeamLeadFinance from '../pages/TeamLead/Finance'
import TeamLeadReports from '../pages/TeamLead/Reports'
import TeamLeadSettings from '../pages/TeamLead/Settings'

const AppWorkspaceRoutes = () => (
  <Route
    path="/app"
    element={
      <ProtectedRoute role={['TEAM_LEAD', 'EMPLOYEE']}>
        <AppLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<Navigate to="dashboard" replace />} />

    <Route path="dashboard" element={<TeamLeadDashboard />} />
    <Route path="projects" element={<TeamLeadProjects />} />
    <Route path="projects/:projectId" element={<TeamLeadProjectDetail />} />
    <Route path="tasks" element={<TeamLeadTasks />} />
    <Route path="tasks/:taskId" element={<TeamLeadTaskDetail />} />
    <Route path="tickets" element={<TeamLeadTickets />} />
    <Route path="work-approval" element={<TeamLeadWorkApproval />} />
    <Route path="finance" element={<TeamLeadFinance />} />
    <Route path="reports" element={<TeamLeadReports />} />
    <Route path="settings" element={<TeamLeadSettings />} />
  </Route>
)

export default AppWorkspaceRoutes