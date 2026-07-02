import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiBell, FiAlertTriangle, FiClock, FiPackage,
  FiCheckCircle, FiInbox, FiX, FiCheck,
} from 'react-icons/fi'
import { useNotificaciones } from '@/hooks/useNotificaciones'

// Tipos del backend
const ICONOS_TIPO = {
  prestamo_nuevo:      { icono: FiInbox,         color: 'text-blue-600 bg-blue-50',   badge: 'bg-blue-500'   },
  prestamo_aprobado:   { icono: FiCheckCircle,    color: 'text-green-600 bg-green-50', badge: 'bg-green-500'  },
  prestamo_rechazado:  { icono: FiAlertTriangle,  color: 'text-red-600 bg-red-50',     badge: 'bg-red-500'    },
  // tipos frontned
  pendiente:           { icono: FiInbox,          color: 'text-blue-600 bg-blue-50',   badge: 'bg-blue-500'   },
  vencido:             { icono: FiAlertTriangle,  color: 'text-red-600 bg-red-50',     badge: 'bg-red-500'    },
  porvencer:           { icono: FiClock,          color: 'text-amber-600 bg-amber-50', badge: 'bg-amber-500'  },
  stock:               { icono: FiPackage,        color: 'text-orange-600 bg-orange-50', badge: 'bg-orange-500' },
}

const tiempoRelativo = (fecha) => {
  if (!fecha) return ''
  const diff = Date.now() - new Date(fecha).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `hace ${hrs} h`
  const dias = Math.floor(hrs / 24)
  return `hace ${dias} d`
}

export const NotificacionesDropdown = () => {
  const { notificaciones, marcarLeida, marcarTodasLeidas } = useNotificaciones()
  const [abierto, setAbierto] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)

  const hayBackend = notificaciones.some(n => n.esBackend)

  useEffect(() => {
    const onClickFuera = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', onClickFuera)
    return () => document.removeEventListener('mousedown', onClickFuera)
  }, [])

  const irA = (ruta) => {
    setAbierto(false)
    navigate(ruta)
  }

  const handleMarcarLeida = async (e, id) => {
    e.stopPropagation()
    await marcarLeida(id)
  }

  const handleMarcarTodas = async (e) => {
    e.stopPropagation()
    await marcarTodasLeidas()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAbierto((v) => !v)}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors relative"
        title="Notificaciones"
      >
        <FiBell size={20} />
        {notificaciones.length > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {notificaciones.length > 9 ? '9+' : notificaciones.length}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Notificaciones</p>
              {notificaciones.length > 0 && (
                <p className="text-xs text-gray-400">{notificaciones.length} sin leer</p>
              )}
            </div>
            {hayBackend && (
              <button
                onClick={handleMarcarTodas}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                title="Marcar todas como leídas"
              >
                <FiCheck size={12} />
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notificaciones.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <FiCheckCircle className="mx-auto text-green-500 mb-2" size={28} />
                <p className="text-sm font-medium text-gray-500">Todo está al día</p>
                <p className="text-xs text-gray-400 mt-1">No tienes notificaciones pendientes</p>
              </div>
            ) : (
              notificaciones.map((n) => {
                const cfg = ICONOS_TIPO[n.tipo] ?? ICONOS_TIPO.stock
                const Icono = cfg.icono
                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[#39A900]/5 transition-colors group"
                  >
                    {/* Icono */}
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.color}`}>
                      <Icono size={16} />
                    </span>

                    {/* Contenido — clickeable para navegar */}
                    <button
                      onClick={() => irA(n.ruta)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className="text-sm font-medium text-gray-900 leading-snug">{n.titulo}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.detalle}</p>
                      {n.fecha && (
                        <p className="text-[11px] text-gray-400 mt-1">{tiempoRelativo(n.fecha)}</p>
                      )}
                    </button>

                    {/* Botón marcar como leída (solo notificaciones del backend) */}
                    {n.esBackend && (
                      <button
                        onClick={(e) => handleMarcarLeida(e, n.id)}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all mt-0.5"
                        title="Marcar como leída"
                      >
                        <FiX size={14} />
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer con tipo indicator */}
          {notificaciones.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center gap-3 flex-wrap">
              {Object.entries({
                'Nueva solicitud': ['bg-blue-500',   n => n.tipo === 'prestamo_nuevo'],
                'Aprobado':        ['bg-green-500',  n => n.tipo === 'prestamo_aprobado'],
                'Rechazado':       ['bg-red-500',    n => n.tipo === 'prestamo_rechazado'],
                'Stock bajo':      ['bg-orange-500', n => n.tipo === 'stock'],
                'Por vencer':      ['bg-amber-500',  n => n.tipo === 'porvencer'],
                'Vencido':         ['bg-red-600',    n => n.tipo === 'vencido'],
              }).map(([label, [color, check]]) => (
                notificaciones.some(check) ? (
                  <span key={label} className="flex items-center gap-1 text-[10px] text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    {label}
                  </span>
                ) : null
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
