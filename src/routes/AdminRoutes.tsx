import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from '../components/ProtectedRoute'

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

const AdminRoutes = () => (
  <Routes>
    <Route
      element={
        <ProtectedRoute role="ADMIN">
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
      <Route path="tasks" element={<Tasks />} />
      <Route path="tasks/:taskId" element={<TaskDetailPage />} />
      <Route path="tickets" element={<Tickets />} />
      <Route path="tickets/:ticketId" element={<AdminTicketDetailPage />} />
      <Route path="work-approval" element={<WorkApprovalPage />} />
      <Route path="work-approval/:id" element={<WorkApprovalDetailPage />} />
      <Route path="attendance-dashboard" element={<AttendanceDashboardPage />} />
      <Route path="leave-approvals" element={<LeaveApprovalManagementPage />} />
      <Route path="attendance" element={<Attendance />} />
      <Route path="finance" element={<Finance />} />
      <Route path="reports" element={<Reports />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Routes>
)

export default AdminRoutes