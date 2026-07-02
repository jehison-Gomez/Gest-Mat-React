import { useNavigate } from 'react-router-dom'
import { FiLogOut } from 'react-icons/fi'
import { NavItem } from '@/components/molecules/NavItem/NavItem'
import { Avatar } from '@/components/atoms/Avatar/Avatar'
import { useAuth } from '@/hooks/useAuth'
import { MENU_ITEMS } from '@/router/menuConfig'
import { authService } from '@/services/authService'
import gestmatLogo from '@/assets/gestmat_logo_transparente.png'

const LABEL_ROL = {
  super_admin:          'Super Admin',
  administrador:        'Administrador',
  instructor_encargado: 'Instructor Enc.',
  instructor:           'Instructor',
  vocero:               'Vocero',
  aprendiz:             'Aprendiz',
}

const itemVisible = (item, rol, hasPermiso) => {
  if (item.soloRoles && !item.soloRoles.includes(rol)) return false
  if (item.permiso) {
    const [m, a] = item.permiso.split(':')
    if (!hasPermiso(m, a)) return false
  }
  if (item.excluirConPermiso) {
    const [m, a] = item.excluirConPermiso.split(':')
    if (hasPermiso(m, a)) return false
  }
  return true
}

export const Sidebar = ({ collapsed }) => {
  const { user, rol, hasPermiso } = useAuth()
  const navigate = useNavigate()

  const menuFiltrado = MENU_ITEMS
    .map(item => {
      if (!item.subItems) return item
      const subs = item.subItems.filter(s => itemVisible(s, rol, hasPermiso))
      return { ...item, subItems: subs }
    })
    .filter(item => {
      if (item.subItems !== undefined) return item.subItems.length > 0
      return itemVisible(item, rol, hasPermiso)
    })

  const handleLogout = async () => {
    try { await authService.logout() } catch { /* continúa */ }
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <aside
      className={`h-full flex flex-col transition-all duration-300 bg-white border-r border-gray-200 ${
        collapsed ? 'w-0 overflow-hidden' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0 flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-[#39A900] flex-shrink-0" />
        <img
          src={gestmatLogo}
          alt="Gest-Mat"
          className="h-8 object-contain"
        />
      </div>

      {/* Navegación */}
      <nav
        className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
      >
        {menuFiltrado.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>

      {/* Usuario al fondo */}
      <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
          <Avatar nombre={user?.nombre ?? ''} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
              {user?.nombre?.split(' ').slice(0, 2).join(' ') ?? '—'}
            </p>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {LABEL_ROL[rol] ?? rol ?? '—'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
            title="Cerrar sesión"
          >
            <FiLogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
