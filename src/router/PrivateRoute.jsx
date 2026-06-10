import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export const PrivateRoute = ({ allowedRoles }) => {
  const { user, hasRole } = useAuth()

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/app/unauthorized" replace />
  }

  return <Outlet />
}
