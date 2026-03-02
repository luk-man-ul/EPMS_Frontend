import { Routes, Route, Navigate } from 'react-router-dom'
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

import TicketDetailPage from '../pages/TeamLead/tickets/detail/TicketDetailPage'
import CreateTicketPage from '../pages/TeamLead/tickets/create/CreateTicketPage'
import EditTicketPage from '../pages/TeamLead/tickets/edit/EditTicketPage'
import CreateTaskPage from '../pages/TeamLead/tasks/create/CreateTaskPage'

const AppWorkspaceRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute role={['TEAM_LEAD', 'EMPLOYEE']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Default Redirect */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Dashboard */}
        <Route path="dashboard" element={<TeamLeadDashboard />} />

        {/* Projects */}
        <Route path="projects" element={<TeamLeadProjects />} />
        <Route path="projects/:projectId" element={<TeamLeadProjectDetail />} />

        {/* Tasks */}
        <Route path="tasks" element={<TeamLeadTasks />} />
        <Route path="tasks/create" element={<CreateTaskPage />} />
        <Route path="tasks/:taskId" element={<TeamLeadTaskDetail />} />

        {/* Tickets */}
        <Route path="tickets" element={<TeamLeadTickets />} />
        <Route path="tickets/create" element={<CreateTicketPage />} />
        <Route path="tickets/:ticketId/edit" element={<EditTicketPage />} />
        <Route path="tickets/:ticketId" element={<TicketDetailPage />} />

        {/* Other Sections */}
        <Route path="work-approval" element={<TeamLeadWorkApproval />} />
        <Route path="finance" element={<TeamLeadFinance />} />
        <Route path="reports" element={<TeamLeadReports />} />
        <Route path="settings" element={<TeamLeadSettings />} />
      </Route>

      {/* Catch invalid /app routes */}
      <Route path="*" element={<Navigate to="/unauthorized" replace />} />
    </Routes>
  )
}

export default AppWorkspaceRoutes