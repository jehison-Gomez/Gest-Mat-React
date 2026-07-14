import { useState, useEffect, useMemo } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { Badge } from '@/components/atoms/Badge/Badge'
import { Boton } from '@/components/atoms/Boton/Boton'
import { prestamosService } from '@/services/prestamosService'
import { useBodega } from '@/hooks/useBodega'
import { useToast } from '@/hooks/useToast'
import { FiCheck, FiX, FiRefreshCw } from 'react-icons/fi'

const badgeEstado = (estado) => {
  const e = (estado ?? '').toLowerCase()
  if (e === 'pendiente')  return 'warning'
  if (e === 'aprobado')   return 'info'
  if (e === 'entregado')  return 'success'
  if (e === 'devuelto')   return 'default'
  if (e === 'rechazado' || e === 'vencido') return 'danger'
  return 'default'
}

export default function MiBodegaPage() {
  const toast = useToast()
  const { bodegas } = useBodega()
  const [prestamos, setPrestamos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [accion, setAccion]       = useState(null)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [procesando, setProcesando]       = useState(false)

  const cargar = async () => {
    setCargando(true)
    try {
      const data = await prestamosService.getPorBodega()
      setPrestamos(Array.isArray(data) ? data : data.data ?? [])
    } catch {
      toast.error('Error al cargar solicitudes')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const pendientes = useMemo(
    () => prestamos.filter(p => p.estado?.toUpperCase() === 'PENDIENTE' || p.estado?.toUpperCase() === 'MODIFICADO'),
    [prestamos],
  )
  const otros = useMemo(
    () => prestamos.filter(p => p.estado?.toUpperCase() !== 'PENDIENTE' && p.estado?.toUpperCase() !== 'MODIFICADO'),
    [prestamos],
  )

  const handleAprobar = async (id) => {
    setProcesando(true)
    try {
      await prestamosService.aprobar(id, {})
      toast.success('Préstamo aprobado')
      setAccion(null)
      cargar()
    } catch (e) {
      const msg = e?.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' | ') : msg || 'Error al aprobar')
    } finally {
      setProcesando(false) }
  }

  const handleRechazar = async (id) => {
    if (!motivoRechazo.trim()) return toast.error('Escribe un motivo de rechazo')
    setProcesando(true)
    try {
      await prestamosService.rechazar(id, motivoRechazo.trim())
      toast.success('Préstamo rechazado')
      setAccion(null)
      setMotivoRechazo('')
      cargar()
    } catch (e) {
      const msg = e?.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(' | ') : msg || 'Error al rechazar')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi Bodega</h1>
            <p className="text-sm text-gray-500 mt-1">
              Solicitudes de préstamo de materiales en{' '}
              {bodegas.length > 0
                ? bodegas.map(b => b.nombre).join(', ')
                : 'tus bodegas'}
            </p>
          </div>
          <button
            onClick={cargar}
            disabled={cargando}
            className="p-2 text-gray-400 hover:text-[#39A900] hover:bg-[#39A900]/10 rounded-lg transition-colors disabled:opacity-40"
            title="Actualizar"
          >
            <FiRefreshCw size={18} className={cargando ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Solicitudes pendientes */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Pendientes de revisión ({pendientes.length})
          </h2>
          {pendientes.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-10 text-center text-gray-400 text-sm">
              No hay solicitudes pendientes
            </div>
          ) : (
            <div className="space-y-3">
              {pendientes.map(p => (
                <PrestamoCard
                  key={p.id}
                  prestamo={p}
                  onAprobar={() => setAccion({ tipo: 'aprobar', prestamo: p })}
                  onRechazar={() => setAccion({ tipo: 'rechazar', prestamo: p })}
                />
              ))}
            </div>
          )}
        </section>

        {/* Historial reciente */}
        {otros.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Historial reciente
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Solicitante', 'Motivo', 'Fecha', 'Estado'].map(c => (
                      <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {otros.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-gray-900 font-medium">{p.solicitante?.nombre ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{p.motivo ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {p.creadoEn ? new Date(p.creadoEn).toLocaleDateString('es-CO') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variante={badgeEstado(p.estado)}>{p.estado ?? '—'}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* Modal de confirmación de acción */}
      {accion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">
              {accion.tipo === 'aprobar' ? 'Aprobar solicitud' : 'Rechazar solicitud'}
            </h3>
            <p className="text-sm text-gray-600">
              Solicitante: <strong>{accion.prestamo.solicitante?.nombre ?? '—'}</strong>
              <br />
              Motivo: {accion.prestamo.motivo ?? '—'}
            </p>

            {accion.tipo === 'rechazar' && (
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                rows={3}
                placeholder="Motivo del rechazo..."
                value={motivoRechazo}
                onChange={e => setMotivoRechazo(e.target.value)}
              />
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => { setAccion(null); setMotivoRechazo('') }}
                disabled={procesando}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-40"
              >
                Cancelar
              </button>
              {accion.tipo === 'aprobar' ? (
                <Boton variante="primario" onClick={() => handleAprobar(accion.prestamo.id)} disabled={procesando}>
                  {procesando ? 'Aprobando...' : 'Aprobar'}
                </Boton>
              ) : (
                <Boton
                  onClick={() => handleRechazar(accion.prestamo.id)}
                  disabled={procesando}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                >
                  {procesando ? 'Rechazando...' : 'Rechazar'}
                </Boton>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

function PrestamoCard({ prestamo, onAprobar, onRechazar }) {
  const fecha = prestamo.creadoEn
    ? new Date(prestamo.creadoEn).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between gap-4 hover:shadow-sm transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900 text-sm">
            {prestamo.solicitante?.nombre ?? 'Solicitante desconocido'}
          </span>
          <Badge variante={badgeEstado(prestamo.estado)}>{prestamo.estado}</Badge>
        </div>
        <p className="text-sm text-gray-600 truncate">{prestamo.motivo ?? 'Sin motivo'}</p>
        <p className="text-xs text-gray-400 mt-1">{fecha}</p>
        {prestamo.ficha && (
          <p className="text-xs text-gray-500 mt-0.5">Ficha: {prestamo.ficha.codigoFicha}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRechazar}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          <FiX size={13} /> Rechazar
        </button>
        <button
          onClick={onAprobar}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#39A900] rounded-lg hover:bg-[#2d8600] transition-colors"
        >
          <FiCheck size={13} /> Aprobar
        </button>
      </div>
    </div>
  )
}
