import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'

export const NavItem = ({ icono: Icono, label, to, subItems }) => {
  const { pathname } = useLocation()
  const tieneActivoHijo = subItems?.some((s) => pathname.startsWith(s.to))
  const [abierto, setAbierto] = useState(() => tieneActivoHijo ?? false)

  if (subItems) {
    return (
      <div>
        <button
          onClick={() => setAbierto(!abierto)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium"
        >
          {Icono && <Icono size={18} className="flex-shrink-0" />}
          <span className="flex-1 text-left">{label}</span>
          {abierto ? <FiChevronDown size={15} /> : <FiChevronRight size={15} />}
        </button>

        {abierto && (
          <div className="ml-8 mt-1 space-y-1">
            {subItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-green-50 text-green-700'
            : 'text-gray-600 hover:bg-gray-100'
        }`
      }
    >
      {Icono && <Icono size={18} className="flex-shrink-0" />}
      <span>{label}</span>
    </NavLink>
  )
}
