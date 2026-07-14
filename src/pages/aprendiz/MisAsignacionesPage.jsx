import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiPlus, FiCalendar, FiAlertCircle, FiTruck } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { Boton } from '@/components/atoms/Boton/Boton'
import { prestamosService } from '@/services/prestamosService'
import { useToast } from '@/hooks/useToast'

/* ── config de estados ─────────────────────────────────────────── */
const ESTADO_CFG = {
  PENDIENTE:  { label: 'Pendiente de aprobación', color: 'bg-amber-100 text-amber-700 border-amber-200',  icon: FiClock,        dot: 'bg-amber-400'  },
  MODIFICADO: { label: 'En revisión',              color: 'bg-blue-100 text-blue-700 border-blue-200',    icon: FiAlertCircle,  dot: 'bg-blue-400'   },
  APROBADO:   { label: 'Aprobado',                 color: 'bg-green-100 text-[#39A900] border-green-200', icon: FiCheckCircle,  dot: 'bg-[#39A900]'  },
  ENTREGADO:  { label: 'Entregado',                color: 'bg-green-100 text-[#39A900] border-green-200', icon: FiTruck,        dot: 'bg-[#39A900]'  },
  DEVUELTO:   { label: 'Devuelto',                 color: 'bg-gray-100 text-gray-500 border-gray-200',    icon: FiCheckCircle,  dot: 'bg-gray-400'   },
  RECHAZADO:  { label: 'Rechazado',                color: 'bg-red-100 text-red-600 border-red-200',       icon: FiXCircle,      dot: 'bg-red-400'    },
  VENCIDO:    { label: 'Vencido',                  color: 'bg-red-100 text-red-600 border-red-200',       icon: FiAlertCircle,  dot: 'bg-red-400'    },
}

const cfg = (estado) => ESTADO_CFG[(estado ?? '').toUpperCase()] ?? ESTADO_CFG.PENDIENTE

const formatFecha = (f) =>
  f && f !== '—'
    ? new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

const PENDIENTES  = ['PENDIENTE', 'MODIFICADO']
const ACTIVOS     = ['APROBADO', 'ENTREGADO']
const HISTORIAL   = ['DEVUELTO', 'RECHAZADO', 'VENCIDO']

/* ── Badge de estado ────────────────────────────────────────────── */
function BadgeEstado({ estado }) {
  const c = cfg(estado)
  const Icono = c.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.color}`}>
      <Icono size={11} />
      {c.label}
    </span>
  )
}

/* ── Tarjeta de solicitud pendiente ─────────────────────────────── */
function TarjetaPendiente({ prestamo }) {
  const c = cfg(prestamo.estado)
  return (
    <div className={`bg-white border-2 ${prestamo.estado?.toUpperCase() === 'PENDIENTE' ? 'border-amber-200' : 'border-blue-200'} rounded-2xl p-5 space-y-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 ${c.dot} animate-pulse`} />
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              Solicitud #{prestamo.id?.slice(-6).toUpperCase()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {prestamo.motivo ?? 'Sin motivo especificado'}
            </p>
          </div>
        </div>
        <BadgeEstado estado={prestamo.estado} />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-gray-400 uppercase font-semibold">Inicio</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">{formatFecha(prestamo.fechaInicio ?? prestamo.fecha_inicio)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-gray-400 uppercase font-semibold">Devolución</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">{formatFecha(prestamo.fechaFin ?? prestamo.fecha_fin)}</p>
        </div>
      </div>

      {prestamo.estado?.toUpperCase() === 'PENDIENTE' && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Tu solicitud está esperando aprobación del encargado de bodega.
        </p>
      )}
      {prestamo.estado?.toUpperCase() === 'MODIFICADO' && (
        <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          El encargado revisó tu solicitud. Espera una resolución.
        </p>
      )}
    </div>
  )
}

/* ── Fila de material activo ────────────────────────────────────── */
function FilaActivo({ prestamo }) {
  const items = prestamo.items ?? []
  const fecha = formatFecha(prestamo.fechaFin ?? prestamo.fecha_fin)
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#39A900]/10 flex items-center justify-center shrink-0">
          <FiPackage size={16} className="text-[#39A900]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {items.length > 0
              ? items.map(i => i.materiale?.nombre ?? i.materialItem?.materiale?.nombre ?? 'Material').join(', ')
              : `Solicitud #${prestamo.id?.slice(-6).toUpperCase()}`}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{prestamo.motivo ?? ''}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <BadgeEstado estado={prestamo.estado} />
        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1 justify-end">
          <FiCalendar size={10} /> Devolver: {fecha}
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   Página principal
══════════════════════════════════════════════════════════════════ */
export default function MisAsignacionesPage() {
  const navigate  = useNavigate()
  const toast     = useToast()
  const [prestamos, setPrestamos] = useState([])
  const [cargando, setCargando]  = useState(true)

  useEffect(() => {
    prestamosService.getMios()
      .then(data => setPrestamos(Array.isArray(data) ? data : data?.data ?? []))
      .catch(() => toast.error('Error al cargar tus solicitudes'))
      .finally(() => setCargando(false))
  }, [])

  const estadoUp  = (p) => (p.estado ?? '').toUpperCase()
  const pendientes = prestamos.filter(p => PENDIENTES.includes(estadoUp(p)))
  const activos    = prestamos.filter(p => ACTIVOS.includes(estadoUp(p)))
  const historial  = prestamos.filter(p => HISTORIAL.includes(estadoUp(p)))

  const proximaFecha = activos
    .map(p => p.fechaFin ?? p.fecha_fin)
    .filter(Boolean).sort()[0] ?? null

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">

        {/* Encabezado */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Préstamos</h1>
            <p className="text-sm text-gray-500 mt-1">Seguimiento de tus solicitudes y materiales activos.</p>
          </div>
          <Boton variante="primario" className="flex items-center gap-2" onClick={() => navigate('/app/prestamos/nuevo')}>
            <FiPlus size={16} /> Solicitar Préstamo
          </Boton>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <FiClock size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">En espera</p>
              <p className="text-xl font-bold text-gray-900">{pendientes.length}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <FiPackage size={18} className="text-[#39A900]" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Activos</p>
              <p className="text-xl font-bold text-gray-900">{activos.length}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <FiCalendar size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Próx. devolución</p>
              <p className="text-sm font-bold text-gray-900 leading-tight">
                {proximaFecha ? new Date(proximaFecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Solicitudes pendientes ── */}
        {pendientes.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <FiClock size={15} className="text-amber-500" />
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Esperando aprobación ({pendientes.length})
              </h2>
            </div>
            {pendientes.map(p => <TarjetaPendiente key={p.id} prestamo={p} />)}
          </section>
        )}

        {/* ── Materiales activos ── */}
        {activos.length > 0 && (
          <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <FiPackage size={15} className="text-[#39A900]" />
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Materiales en mi poder ({activos.length})
              </h2>
            </div>
            <div className="px-5">
              {activos.map(p => <FilaActivo key={p.id} prestamo={p} />)}
            </div>
          </section>
        )}

        {/* ── Estado vacío ── */}
        {!cargando && prestamos.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">
            <FiPackage size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">No tienes solicitudes aún</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">Solicita un material para comenzar</p>
            <Boton variante="primario" onClick={() => navigate('/app/prestamos/nuevo')}>
              <FiPlus size={14} className="inline mr-1.5" /> Solicitar Préstamo
            </Boton>
          </div>
        )}

        {/* ── Historial ── */}
        {historial.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Historial</h2>
            <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-50 overflow-hidden">
              {historial.map(p => (
                <div key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Solicitud #{p.id?.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.motivo ?? ''}</p>
                  </div>
                  <BadgeEstado estado={p.estado} />
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </DashboardLayout>
  )
}
