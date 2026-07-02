import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

// allowedRoles:     array de roles que pueden acceder por rol
// permisoRequerido: 'modulo:accion' — si el usuario tiene este permiso también puede acceder
// Lógica: acceso si (tieneRol) OR (tienePermiso)
export const PrivateRoute = ({ allowedRoles, permisoRequerido }) => {
  const { user, hasRole, hasPermiso } = useAuth()

  if (!user) return <Navigate to="/" replace />

  const tieneRol     = hasRole(allowedRoles ?? [])
  const tienePermiso = permisoRequerido
    ? hasPermiso(...permisoRequerido.split(':'))
    : false

  if (!tieneRol && !tienePermiso) {
    return <Navigate to="/app/unauthorized" replace />
  }

  return <Outlet />
}
