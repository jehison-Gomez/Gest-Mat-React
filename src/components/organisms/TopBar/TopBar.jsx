import { useNavigate, useLocation } from 'react-router-dom'
import { FiMenu, FiLogOut } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/atoms/Avatar/Avatar'
import { authService } from '@/services/authService'
import { NotificacionesDropdown } from '@/components/organisms/NotificacionesDropdown/NotificacionesDropdown'

const RUTAS_LABEL = {
  '/app/dashboard':        'Dashboard',
  '/app/materiales':       'Materiales',
  '/app/usuarios':         'Usuarios',
  '/app/fichas':           'Fichas',
  '/app/programas':        'Programas',
  '/app/areas':            'Áreas',
  '/app/categorias':       'Categorías',
  '/app/movimientos':      'Movimientos',
  '/app/kardex':           'Kardex',
  '/app/reportes':         'Reportes',
  '/app/prestamos/nuevo':  'Nuevo Préstamo',
  '/app/prestamos':        'Préstamos',
  '/app/mis-asignaciones': 'Mis Asignaciones',
  '/app/mis-fichas':       'Mis Fichas',
  '/app/mis-prestamos':    'Mis Préstamos',
  '/app/mi-perfil':        'Mi Perfil',
  '/app/centros':          'Centros',
  '/app/sedes':            'Sedes',
  '/app/roles':            'Roles',
  '/app/permisos':         'Permisos',
  '/app/tipos-ubicacion':  'Tipos de Ubicación',
  '/app/ubicaciones':      'Ubicaciones',
  '/app/gestion-area':     'Gestión de Área',
}

export const TopBar = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()

  const paginaLabel = RUTAS_LABEL[pathname]
    ?? Object.entries(RUTAS_LABEL).find(([k]) => pathname.startsWith(k))?.[1]
    ?? ''

  const handleLogout = async () => {
    try { await authService.logout() } catch { /* continúa */ }
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0">

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Menú"
        >
          <FiMenu size={18} />
        </button>

        {paginaLabel && (
          <span className="text-sm font-semibold text-gray-500 hidden sm:block tracking-wide">
            {paginaLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <NotificacionesDropdown />

        <button
          onClick={() => navigate('/app/mi-perfil')}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors ml-1"
          title="Mi Perfil"
        >
          <Avatar nombre={user?.nombre ?? ''} size="xs" />
          <span className="text-sm font-semibold text-gray-700 hidden sm:block max-w-32 truncate">
            {user?.nombre?.split(' ').slice(0, 2).join(' ') ?? 'Perfil'}
          </span>
        </button>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-1"
          title="Cerrar sesión"
        >
          <FiLogOut size={17} />
        </button>
      </div>
    </header>
  )
}
