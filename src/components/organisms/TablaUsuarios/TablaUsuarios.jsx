import { useState } from 'react'
import { Badge } from '@/components/atoms/Badge/Badge'
import { Avatar } from '@/components/atoms/Avatar/Avatar'
import { FiEdit2, FiChevronLeft, FiChevronRight, FiUsers } from 'react-icons/fi'

const badgeRol = (rol) => {
  const r = (rol ?? '').toLowerCase()
  if (r.includes('admin'))      return 'purple'
  if (r.includes('encargado'))  return 'orange'
  if (r.includes('instructor')) return 'info'
  if (r.includes('vocero'))     return 'warning'
  return 'default'
}

const ToggleEstado = ({ activo, onChange }) => {
  const [cargando, setCargando] = useState(false)

  const handleClick = async () => {
    setCargando(true)
    try { await onChange(!activo) }
    finally { setCargando(false) }
  }

  return (
    <button
      onClick={handleClick}
      disabled={cargando}
      title={activo ? 'Desactivar usuario' : 'Activar usuario'}
      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-60 ${
        activo ? 'bg-[#39A900] focus-visible:ring-[#39A900]/40' : 'bg-gray-200 focus-visible:ring-gray-400'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
          activo ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export const TablaUsuarios = ({
  usuarios = [],
  totalRegistros = 0,
  paginaActual = 1,
  porPagina = 10,
  onAnterior,
  onSiguiente,
  onEditar,
  onToggleEstado,
  mostrarArea = true,
}) => {
  const columnas = ['Usuario', 'Rol', ...(mostrarArea ? ['Área'] : []), 'Estado', 'Acciones']
  const inicio = (paginaActual - 1) * porPagina + 1
  const fin = Math.min(paginaActual * porPagina, totalRegistros)
  const totalPaginas = Math.ceil(totalRegistros / porPagina)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#39A900]">
              {columnas.map((col) => (
                <th key={col} className="px-5 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={mostrarArea ? 5 : 4} className="py-16 text-center">
                  <FiUsers size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-400">No se encontraron usuarios</p>
                </td>
              </tr>
            ) : (
              usuarios.map((u, i) => (
                <tr key={u.id} className={`border-b border-gray-50 hover:bg-[#39A900]/5 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar nombre={u.nombre} size="sm" />
                      <div>
                        <p className="font-semibold text-gray-800 leading-tight">{u.nombre}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{u.correo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variante={badgeRol(u.rol)}>
                      {u.rolLabel ?? u.rol ?? '—'}
                    </Badge>
                  </td>
                  {mostrarArea && <td className="px-5 py-3.5 text-gray-500 text-sm">{u.area ?? '—'}</td>}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <ToggleEstado
                        activo={u.activo}
                        onChange={(nuevoEstado) => onToggleEstado?.(u, nuevoEstado)}
                      />
                      <span className={`text-xs font-semibold ${u.activo ? 'text-[#39A900]' : 'text-gray-400'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => onEditar?.(u)}
                      title="Editar"
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <FiEdit2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalRegistros > 0 && (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{inicio}–{fin}</span> de{' '}
            <span className="font-semibold text-gray-700">{totalRegistros}</span> usuarios
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onAnterior}
              disabled={paginaActual <= 1}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:border-[#39A900] hover:text-[#39A900] hover:bg-[#39A900]/8 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronLeft size={14} /> Anterior
            </button>
            <span className="text-xs text-gray-400 px-1">{paginaActual} / {totalPaginas}</span>
            <button
              onClick={onSiguiente}
              disabled={fin >= totalRegistros}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:border-[#39A900] hover:text-[#39A900] hover:bg-[#39A900]/8 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Siguiente <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
