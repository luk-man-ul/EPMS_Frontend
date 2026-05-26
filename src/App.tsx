import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { useAuth } from './context/AuthContext'
import { FullScreenLoader } from './components/shared/FullScreenLoader'
import { PwaUpdatePrompt } from './components/shared/PwaUpdatePrompt'

import AdminRoutes from './routes/AdminRoutes'
import AppWorkspaceRoutes from './routes/AppWorkspaceRoutes'

import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import Unauthorized from './pages/Unauthorized'

// Redirects authenticated users to their dashboard instead of login.
// Shows the fullscreen loader while auth bootstrap is in progress so the
// root path never flashes a blank screen before the redirect resolves.
function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
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

      {/* PWA update notification — shown when a new SW is waiting to activate.
          User manually triggers the update; no auto-reload. */}
      <PwaUpdatePrompt />
    </ToastProvider>
  )
}

export default App