import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminRoutes from './routes/AdminRoutes'
import AppWorkspaceRoutes from './routes/AppWorkspaceRoutes'

import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import Unauthorized from './pages/Unauthorized'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Inject Route Trees */}
        {AdminRoutes()}
        {AppWorkspaceRoutes()}

        <Route path="*" element={<Navigate to="/auth/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App