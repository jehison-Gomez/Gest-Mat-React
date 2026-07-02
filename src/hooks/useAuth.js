import { useMemo } from 'react'

export const ROLES = {
  SUPER_ADMIN:         'super_admin',
  ADMINISTRADOR:       'administrador',
  INSTRUCTOR_ENCARGADO:'instructor_encargado',
  INSTRUCTOR:          'instructor',
  VOCERO:              'vocero',
  APRENDIZ:            'aprendiz',
}

// Permisos mínimos garantizados por rol, usados como fallback cuando
// el usuario aún no ha recargado sus permisos desde el backend
const FALLBACK_POR_ROL = {
  super_admin: new Set([
    'centros:leer','centros:crear','centros:actualizar','centros:eliminar',
    'sedes:leer','sedes:crear','sedes:actualizar','sedes:eliminar',
    'usuarios:leer','usuarios:crear','usuarios:actualizar',
  ]),
  administrador: new Set([
    'dashboard:leer',
    'areas:leer','areas:crear','areas:actualizar','areas:eliminar',
    'materiales:leer','materiales:crear','materiales:actualizar','materiales:eliminar',
    'ubicaciones:leer','ubicaciones:crear','ubicaciones:actualizar','ubicaciones:eliminar',
    'prestamos:leer','prestamos:crear','prestamos:aprobar','prestamos:rechazar','prestamos:devolver',
    'kardex:leer',
    'movimientos:leer','movimientos:crear',
    'fichas:leer','fichas:crear','fichas:actualizar','fichas:eliminar',
    'programas:leer','programas:crear','programas:actualizar','programas:eliminar',
    'usuarios:leer','usuarios:crear','usuarios:actualizar','usuarios:eliminar','usuarios:asignar_rol','usuarios:asignar_permisos',
    'roles:leer','roles:crear','roles:actualizar','roles:eliminar',
    'configuracion:leer','configuracion:crear','configuracion:actualizar','configuracion:eliminar',
    'reportes:leer',
  ]),
  instructor_encargado: new Set([
    'dashboard:leer',
    'areas:leer',
    'materiales:leer','materiales:crear','materiales:actualizar',
    'ubicaciones:leer','ubicaciones:crear','ubicaciones:actualizar',
    'prestamos:leer','prestamos:crear','prestamos:aprobar','prestamos:rechazar','prestamos:devolver',
    'kardex:leer',
    'movimientos:leer','movimientos:crear',
    'fichas:leer','fichas:crear','fichas:actualizar',
    'programas:leer',
    'configuracion:leer',
    'reportes:leer',
  ]),
  instructor: new Set([
    'dashboard:leer',
    'materiales:leer',
    'prestamos:leer','prestamos:crear',
    'fichas:leer',
    'programas:leer',
    'reportes:leer',
  ]),
  vocero:   new Set(['prestamos:leer','prestamos:crear']),
  aprendiz: new Set(['prestamos:leer','prestamos:crear']),
}

export const useAuth = () => {
  const userString  = localStorage.getItem('user')
  const permisosStr = localStorage.getItem('permisos')

  const user = useMemo(() => {
    try { return userString ? JSON.parse(userString) : null }
    catch { return null }
  }, [userString])

  const permisos = useMemo(() => {
    try { return permisosStr ? JSON.parse(permisosStr) : [] }
    catch { return [] }
  }, [permisosStr])

  const hasRole = (allowedRoles) => {
    if (!user || !Array.isArray(allowedRoles)) return false
    return allowedRoles.includes(user.rol)
  }

  // Si ya hay permisos cargados del backend → usarlos
  // Si no (primera sesión, o backend no reiniciado) → usar fallback por rol
  const hasPermiso = (modulo, accion) => {
    const clave = `${modulo}:${accion}`
    if (Array.isArray(permisos) && permisos.length > 0) {
      return permisos.some(p => p.modulo === modulo && p.accion === accion)
    }
    // Fallback: permisos derivados del rol actual
    return FALLBACK_POR_ROL[user?.rol]?.has(clave) ?? false
  }

  return {
    user,
    rol:                   user?.rol,
    sedeId:                user?.sedeId ?? null,
    permisos,
    isSuperAdmin:          user?.rol === ROLES.SUPER_ADMIN,
    isAdministrador:       user?.rol === ROLES.ADMINISTRADOR,
    isInstructorEncargado: user?.rol === ROLES.INSTRUCTOR_ENCARGADO,
    isInstructor:          user?.rol === ROLES.INSTRUCTOR,
    isVocero:              user?.rol === ROLES.VOCERO,
    isAprendiz:            user?.rol === ROLES.APRENDIZ,
    isVoceroOAprendiz:     [ROLES.VOCERO, ROLES.APRENDIZ].includes(user?.rol),
    hasRole,
    hasPermiso,
  }
}
