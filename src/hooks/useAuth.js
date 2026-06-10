import { useMemo } from 'react'

export const ROLES = {
  ADMINISTRADOR: 'administrador',
  INSTRUCTOR_ENCARGADO: 'instructor_encargado',
  INSTRUCTOR: 'instructor',
  VOCERO: 'vocero',
  APRENDIZ: 'aprendiz',
}

export const useAuth = () => {
  const userString = localStorage.getItem('user')
  const user = useMemo(() => {
    try {
      return userString ? JSON.parse(userString) : null
    } catch {
      return null
    }
  }, [userString])

  const hasRole = (allowedRoles) => {
    if (!user) return false
    if (!Array.isArray(allowedRoles)) return false
    return allowedRoles.includes(user.rol)
  }

  return {
    user,
    rol: user?.rol,
    isAdministrador: user?.rol === ROLES.ADMINISTRADOR,
    isInstructorEncargado: user?.rol === ROLES.INSTRUCTOR_ENCARGADO,
    isInstructor: user?.rol === ROLES.INSTRUCTOR,
    isVocero: user?.rol === ROLES.VOCERO,
    isAprendiz: user?.rol === ROLES.APRENDIZ,
    isVoceroOAprendiz: [ROLES.VOCERO, ROLES.APRENDIZ].includes(user?.rol),
    hasRole,
  }
}
