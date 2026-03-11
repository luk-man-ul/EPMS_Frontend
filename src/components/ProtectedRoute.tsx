import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export interface ProtectedRouteProps {
  children?: React.ReactNode
  requiredRoles?: string[]
  requiredPermissions?: string[]
}

/**
 * ProtectedRoute component for role-based and permission-based access control
 * 
 * Supports both:
 * - Wrapped components passed as children
 * - Nested routes rendered through <Outlet />
 * 
 * @param children - Optional child components to render if access is granted
 * @param requiredRoles - Optional array of roles that are allowed to access this route
 * @param requiredPermissions - Optional array of permissions required to access this route
 * 
 * @returns The children/Outlet if authorized, or redirects to login/unauthorized page
 * 
 * Requirements: 10.7, 13.9, 13.10
 */
export function ProtectedRoute({ 
  children, 
  requiredRoles, 
  requiredPermissions 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (loading) {
    return null
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Check role-based access control
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = String(user.role).toUpperCase().trim()
    const allowedRoles = requiredRoles.map(role => 
      String(role).toUpperCase().trim()
    )

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  // Check permission-based access control
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission =>
      user.permissions?.includes(permission)
    )

    if (!hasAllPermissions) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  // Support both children (wrapped components) and Outlet (nested routes)
  return children ? <>{children}</> : <Outlet />
}