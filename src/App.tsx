import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { useAuth } from './context/AuthContext'

import AdminRoutes from './routes/AdminRoutes'
import AppWorkspaceRoutes from './routes/AppWorkspaceRoutes'

import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import Unauthorized from './pages/Unauthorized'

// Redirects authenticated users to their dashboard instead of login
function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/auth/login" replace />
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/app/dashboard" replace />
}

const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<RootRedirect />} />

          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/admin/*" element={<AdminRoutes />} />

          <Route path="/app/*" element={<AppWorkspaceRoutes />} />

          <Route path="*" element={<Navigate to="/auth/login" replace />} />

        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App