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

// Attendance & Leave - Shared Pages
import CheckInPage from '../pages/shared/attendance/CheckInPage'
import MyAttendancePage from '../pages/shared/attendance/MyAttendancePage'
import LeaveRequestPage from '../pages/shared/leave/LeaveRequestPage'
import MyLeavePage from '../pages/shared/leave/MyLeavePage'
import LeaveApprovalManagementPage from '../pages/shared/leave/LeaveApprovalManagementPage'

// Attendance & Leave - Team Lead Pages
import TeamAttendancePage from '../pages/TeamLead/attendance/TeamAttendancePage'

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

        {/* Attendance & Leave - Employee Pages */}
        <Route path="attendance/check-in" element={<CheckInPage />} />
        <Route path="attendance/my" element={<MyAttendancePage />} />
        <Route path="leave/request" element={<LeaveRequestPage />} />
        <Route path="leave/my" element={<MyLeavePage />} />

        {/* Attendance & Leave - Team Lead Pages */}
        <Route 
          path="team/attendance" 
          element={
            <ProtectedRoute role={['TEAM_LEAD', 'ADMIN']}>
              <TeamAttendancePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="team/leave-approvals" 
          element={
            <ProtectedRoute role={['TEAM_LEAD', 'ADMIN']}>
              <LeaveApprovalManagementPage />
            </ProtectedRoute>
          } 
        />

        {/* Other Sections */}
        <Route 
          path="work-approval" 
          element={
            <ProtectedRoute role={['TEAM_LEAD', 'ADMIN']}>
              <TeamLeadWorkApproval />
            </ProtectedRoute>
          } 
        />
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