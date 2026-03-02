import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

import AdminRoutes from './routes/AdminRoutes'
import AppWorkspaceRoutes from './routes/AppWorkspaceRoutes'

import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import Unauthorized from './pages/Unauthorized'

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>

            <Route path="/" element={<Navigate to="/auth/login" replace />} />

            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* ✅ Correct way */}
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/app/*" element={<AppWorkspaceRoutes />} />

            <Route path="*" element={<Navigate to="/auth/login" replace />} />

          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App