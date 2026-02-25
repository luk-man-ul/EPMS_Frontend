import { Route, Navigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from '../components/ProtectedRoute'

import AdminDashboard from '../pages/admin/dashboard/AdminDashboard'
import EmployeesPage from '../pages/admin/employees/EmployeesPage'
import Projects from '../pages/admin/Projects'
import Tasks from '../pages/admin/Tasks'
import Tickets from '../pages/admin/Tickets'
import Attendance from '../pages/admin/Attendance'
import Finance from '../pages/admin/Finance'
import Reports from '../pages/admin/Reports'
import Notifications from '../pages/admin/Notifications'
import Settings from '../pages/admin/Settings'
import AdminProjectDetail from '../pages/admin/projects/detail/ProjectDetailPage'
import TaskDetailPage from '../pages/admin/tasks/detail/TaskDetailPage'

const AdminRoutes = () => (
  <Route
    path="/admin"
    element={
      <ProtectedRoute role="ADMIN">
        <AdminLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<Navigate to="dashboard" replace />} />

    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="employees" element={<EmployeesPage />} />
    <Route path="projects" element={<Projects />} />
    <Route path="projects/:projectId" element={<AdminProjectDetail />} />
    <Route path="tasks" element={<Tasks />} />
    <Route path="tasks/:taskId" element={<TaskDetailPage />} />
    <Route path="tickets" element={<Tickets />} />
    <Route path="attendance" element={<Attendance />} />
    <Route path="finance" element={<Finance />} />
    <Route path="reports" element={<Reports />} />
    <Route path="notifications" element={<Notifications />} />
    <Route path="settings" element={<Settings />} />
  </Route>
)

export default AdminRoutes