import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  role?: string | string[]
  permission?: string
  children: React.ReactNode
}

const ProtectedRoute = ({ role, permission, children }: Props) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  // ROLE CHECK
  if (role) {
    const userRole = String(user.role).toUpperCase().trim()

    if (Array.isArray(role)) {
      const allowedRoles = role.map(r =>
        String(r).toUpperCase().trim()
      )

      if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />
      }
    } else {
      if (userRole !== String(role).toUpperCase().trim()) {
        return <Navigate to="/unauthorized" replace />
      }
    }
  }

  // PERMISSION CHECK
  if (permission) {
    if (!user.permissions?.includes(permission)) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute