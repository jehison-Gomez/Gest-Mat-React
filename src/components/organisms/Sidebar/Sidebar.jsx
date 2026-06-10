import { Logo } from '@/components/atoms/Logo/Logo'
import { Avatar } from '@/components/atoms/Avatar/Avatar'
import { NavItem } from '@/components/molecules/NavItem/NavItem'
import { useAuth } from '@/hooks/useAuth'
import { menuPorRol } from '@/router/menuConfig'

export const Sidebar = ({ collapsed }) => {
  const { user, rol } = useAuth()
  const menuItems = menuPorRol[rol] ?? menuPorRol.aprendiz

  return (
    <aside
      className={`h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-0 overflow-hidden' : 'w-64'
      }`}
    >
      <div className="p-5 border-b border-gray-100">
        <Logo size="sm" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar nombre={user?.nombre || ''} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.nombre || '—'}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {(rol ?? '').replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
