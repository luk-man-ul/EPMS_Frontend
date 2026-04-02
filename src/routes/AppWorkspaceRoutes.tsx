import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { RedirectRoute } from '../components/RedirectRoute'

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

// WFH Pages
import WfhRequestPage from '../pages/shared/wfh/WfhRequestPage'
import MyWfhPage from '../pages/shared/wfh/MyWfhPage'
import WfhApprovalPage from '../pages/shared/wfh/WfhApprovalPage'

// Attendance & Leave - Team Lead Pages
import TeamAttendancePage from '../pages/TeamLead/attendance/TeamAttendancePage'

// Chat
import ChatPage from '../pages/chat/ChatPage'

const AppWorkspaceRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute requiredRoles={['TEAM_LEAD', 'EMPLOYEE']}>
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

        {/* Task Routes */}
        <Route path="tasks" element={<TeamLeadTasks />} />
        <Route path="tasks/create" element={<CreateTaskPage />} />
        <Route path="tasks/:taskId" element={<TeamLeadTaskDetail />} />
        <Route 
          path="tasks/approval" 
          element={
            <ProtectedRoute requiredRoles={['TEAM_LEAD', 'ADMIN']}>
              <TeamLeadWorkApproval />
            </ProtectedRoute>
          } 
        />

        {/* Tickets */}
        <Route path="tickets" element={<TeamLeadTickets />} />
        <Route path="tickets/create" element={<CreateTicketPage />} />
        <Route path="tickets/:ticketId/edit" element={<EditTicketPage />} />
        <Route path="tickets/:ticketId" element={<TicketDetailPage />} />

        {/* Attendance Routes */}
        <Route path="attendance" element={<MyAttendancePage />} />
        <Route path="attendance/check-in" element={<CheckInPage />} />
        <Route path="attendance/history" element={<MyAttendancePage />} />
        <Route 
          path="attendance/team" 
          element={
            <ProtectedRoute requiredRoles={['TEAM_LEAD', 'ADMIN']}>
              <TeamAttendancePage />
            </ProtectedRoute>
          } 
        />

        {/* Leave Routes */}
        <Route path="leave" element={<MyLeavePage />} />
        <Route path="leave/request" element={<LeaveRequestPage />} />
        <Route path="leave/history" element={<MyLeavePage />} />
        <Route 
          path="leave/approvals" 
          element={
            <ProtectedRoute requiredRoles={['TEAM_LEAD', 'ADMIN']}>
              <LeaveApprovalManagementPage />
            </ProtectedRoute>
          } 
        />

        {/* WFH Routes */}
        <Route path="wfh" element={<MyWfhPage />} />
        <Route path="wfh/request" element={<WfhRequestPage />} />
        <Route
          path="wfh/approvals"
          element={
            <ProtectedRoute requiredRoles={['TEAM_LEAD', 'ADMIN']}>
              <WfhApprovalPage />
            </ProtectedRoute>
          }
        />

        {/* Chat */}
        <Route path="chat" element={<ChatPage />} />

        {/* Other Sections */}
        <Route path="finance" element={<TeamLeadFinance />} />
        <Route 
          path="reports" 
          element={
            <ProtectedRoute requiredRoles={['TEAM_LEAD', 'ADMIN']}>
              <TeamLeadReports />
            </ProtectedRoute>
          } 
        />
        <Route path="settings" element={<TeamLeadSettings />} />

        {/* ===== REDIRECT ROUTES - Old to New Route Mappings ===== */}
        
        {/* Attendance Redirects */}
        <Route path="attendance/my" element={<RedirectRoute from="/app/attendance/my" to="/app/attendance/history" />} />
        <Route path="team/attendance" element={<RedirectRoute from="/app/team/attendance" to="/app/attendance/team" />} />
        
        {/* Leave Redirects */}
        <Route path="leave/my" element={<RedirectRoute from="/app/leave/my" to="/app/leave/history" />} />
        <Route path="team/leave-approvals" element={<RedirectRoute from="/app/team/leave-approvals" to="/app/leave/approvals" />} />
        
        {/* Task Redirects */}
        <Route path="work-approval" element={<RedirectRoute from="/app/work-approval" to="/app/tasks/approval" />} />
      </Route>

      {/* Catch invalid /app routes */}
      <Route path="*" element={<Navigate to="/unauthorized" replace />} />
    </Routes>
  )
}

export default AppWorkspaceRoutes