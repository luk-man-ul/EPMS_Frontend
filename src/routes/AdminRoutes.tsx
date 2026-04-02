import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { RedirectRoute } from '../components/RedirectRoute'

import AdminDashboard from '../pages/admin/dashboard/AdminDashboard'
import EmployeesPage from '../pages/admin/employees/EmployeesPage'
import EmployeeDetail from '../pages/admin/employees/EmployeeDetail'
import Projects from '../pages/admin/Projects'
import Tasks from '../pages/admin/Tasks'
import Tickets from '../pages/admin/Tickets'
import Attendance from '../pages/admin/Attendance'
import Finance from '../pages/admin/Finance'
import Reports from '../pages/admin/Reports'
import Notifications from '../pages/admin/Notifications'
import Settings from '../pages/admin/Settings'
import AdminProjectDetail from '../pages/admin/projects/detail/ProjectDetailPage'
import TaskDetailPage from '../pages/shared/tasks/details/TaskDetailPage'
import AdminTicketDetailPage from '../pages/admin/tickets/detail/TicketDetailPage'
import WorkApprovalPage from '../pages/TeamLead/workApproval/WorkApprovalPage'
import WorkApprovalDetailPage from '../pages/TeamLead/workApproval/detail/WorkApprovalDetailPage'

// Attendance & Leave - Admin Pages
import AttendanceDashboardPage from '../pages/admin/attendance/AttendanceDashboardPage'
import LeaveApprovalManagementPage from '../pages/shared/leave/LeaveApprovalManagementPage'

// WFH Pages
import WfhManagementPage from '../pages/shared/wfh/WfhManagementPage'

// Chat
import ChatPage from '../pages/chat/ChatPage'

const AdminRoutes = () => (
  <Routes>
    <Route
      element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />

      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="employees" element={<EmployeesPage />} />
      <Route path="employees/:id" element={<EmployeeDetail />} />
      <Route path="projects" element={<Projects />} />
      <Route path="projects/:projectId" element={<AdminProjectDetail />} />
      
      {/* Task Routes */}
      <Route path="tasks" element={<Tasks />} />
      <Route path="tasks/:taskId" element={<TaskDetailPage />} />
      <Route path="tasks/approval" element={<WorkApprovalPage />} />
      <Route path="tasks/approval/:id" element={<WorkApprovalDetailPage />} />
      
      {/* Ticket Routes */}
      <Route path="tickets" element={<Tickets />} />
      <Route path="tickets/:ticketId" element={<AdminTicketDetailPage />} />
      
      {/* Attendance Routes */}
      <Route path="attendance" element={<AttendanceDashboardPage />} />
      <Route path="attendance/reports" element={<AttendanceDashboardPage />} />
      
      {/* Leave Routes */}
      <Route path="leave" element={<LeaveApprovalManagementPage />} />
      <Route path="leave/approvals" element={<LeaveApprovalManagementPage />} />

      {/* WFH Routes */}
      <Route path="wfh" element={<WfhManagementPage />} />
      <Route path="wfh/requests" element={<WfhManagementPage />} />
      <Route path="wfh/approvals" element={<RedirectRoute from="/admin/wfh/approvals" to="/admin/wfh/requests" />} />
      <Route path="wfh/all" element={<RedirectRoute from="/admin/wfh/all" to="/admin/wfh/requests" />} />
      
      {/* Chat */}
      <Route path="chat" element={<ChatPage />} />
      
      {/* ===== REDIRECT ROUTES - Old to New Route Mappings ===== */}
      
      {/* Legacy Routes - Keep for backward compatibility */}
      <Route path="work-approval" element={<RedirectRoute from="/admin/work-approval" to="/admin/tasks/approval" />} />
      <Route path="attendance-dashboard" element={<RedirectRoute from="/admin/attendance-dashboard" to="/admin/attendance/reports" />} />
      <Route path="leave-approvals" element={<RedirectRoute from="/admin/leave-approvals" to="/admin/leave/approvals" />} />
      
      {/* Other Routes */}
      <Route path="finance" element={<Finance />} />
      <Route path="reports" element={<Reports />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Routes>
)

export default AdminRoutes