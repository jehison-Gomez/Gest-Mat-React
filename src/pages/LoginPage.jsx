import { useNavigate } from 'react-router-dom'
import { LoginLayout } from '@/components/templates/LoginLayout/LoginLayout'
import { LoginForm } from '@/components/organisms/LoginForm/LoginForm'
import { ROLES } from '@/hooks/useAuth'

const rutaPorRol = {
  [ROLES.SUPER_ADMIN]: '/app/centros',
  [ROLES.ADMINISTRADOR]: '/app/dashboard',
  [ROLES.INSTRUCTOR_ENCARGADO]: '/app/dashboard',
  [ROLES.INSTRUCTOR]: '/app/mis-fichas',
  [ROLES.VOCERO]: '/app/mis-asignaciones',
  [ROLES.APRENDIZ]: '/app/mis-asignaciones',
}

export default function LoginPage() {
  const navigate = useNavigate()

  const handleLoginSuccess = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') ?? '{}')
      const ruta = rutaPorRol[user?.rol] ?? '/app/dashboard'
      navigate(ruta)
    } catch {
      navigate('/app/dashboard')
    }
  }

  return (
    <LoginLayout>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </LoginLayout>
  )
}
