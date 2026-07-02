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
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            tieneActivoHijo
              ? 'bg-[#39A900]/10 text-[#39A900]'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          {Icono && (
            <Icono
              size={17}
              className={`flex-shrink-0 ${tieneActivoHijo ? 'text-[#39A900]' : 'text-gray-400'}`}
            />
          )}
          <span className="flex-1 text-left">{label}</span>
          <span className={tieneActivoHijo ? 'text-[#39A900]/60' : 'text-gray-300'}>
            {abierto ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
          </span>
        </button>

        {abierto && (
          <div className="ml-4 mt-0.5 pl-3 border-l-2 border-gray-100 space-y-0.5">
            {subItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? 'text-[#39A900] font-semibold bg-[#39A900]/8'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
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
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-[#39A900]/10 text-[#39A900]'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {Icono && (
            <Icono
              size={17}
              className={`flex-shrink-0 ${isActive ? 'text-[#39A900]' : 'text-gray-400'}`}
            />
          )}
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}
