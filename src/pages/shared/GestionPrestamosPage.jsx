import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar'
import { ModalConfirmacion } from '@/components/molecules/ModalConfirmacion/ModalConfirmacion'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { Badge } from '@/components/atoms/Badge/Badge'
import { Boton } from '@/components/atoms/Boton/Boton'
import { prestamosService } from '@/services/prestamosService'
import { materialesService } from '@/services/materialesService'
import api from '@/services/api'
import { useToast } from '@/hooks/useToast'
import { exportToExcel } from '@/utils/exportToExcel'
import { FiCheck, FiX, FiTruck, FiRotateCcw, FiEye, FiPlus, FiDownload } from 'react-icons/fi'

const POR_PAGINA = 10

const badgeEstado = (estado) => {
  const e = (estado ?? '').toLowerCase()
  if (e === 'pendiente') return 'warning'
  if (e === 'aprobado') return 'info'
  if (e === 'entregado' || e === 'activo') return 'success'
  if (e === 'devuelto' || e === 'devolucion_parcial') return 'default'
  if (e === 'rechazado' || e === 'vencido') return 'danger'
  return 'default'
}

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'devuelto', label: 'Devuelto' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'vencido', label: 'Vencido' },
]

export default function GestionPrestamosPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [prestamos, setPrestamos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [pagina, setPagina] = useState(1)
  const [accionPendiente, setAccionPendiente] = useState(null)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [detalle, setDetalle] = useState(null)
  const [historial, setHistorial] = useState([])
  const [historialCargando, setHistorialCargando] = useState(false)
  // Aprobación parcial de consumibles
  const [consumiblesPrestamo, setConsumiblesPrestamo] = useState([])
  const [cantidadesAprobadas, setCantidadesAprobadas] = useState({})

  useEffect(() => {
    prestamosService.revisarVencidos().catch(() => {})
    cargar()
  }, [])

  // Cargar consumibles cuando se abre el modal de aprobación
  useEffect(() => {
    if (accionPendiente?.tipo === 'aprobar') {
      const prestamoId = accionPendiente.prestamo.id
      api.get(`/api/prestamo-consumible/prestamo/${prestamoId}`)
        .then((r) => {
          const lista = Array.isArray(r.data) ? r.data : (r.data?.data ?? [])
          setConsumiblesPrestamo(lista)
          // Inicializar con cantidad solicitada
          const init = {}
          lista.forEach((c) => {
            init[c.id] = c.cantidadAprobada ?? c.cantidadSolicitada ?? c.cantidad ?? 0
          })
          setCantidadesAprobadas(init)
        })
        .catch(() => {
          setConsumiblesPrestamo([])
          setCantidadesAprobadas({})
        })
    } else {
      setConsumiblesPrestamo([])
      setCantidadesAprobadas({})
    }
  }, [accionPendiente])

  const cargar = async () => {
    try {
      const [data, itemsPrestados, items] = await Promise.all([
        prestamosService.getAll(),
        api.get('/api/prestamo-item').then((r) => r.data).catch(() => []),
        materialesService.getAllItems().catch(() => []),
      ])

      const nombrePorMaterialItemId = new Map(
        items.map((i) => [i.id, `${i.materiale?.nombre ?? 'Material'} (${i.codigoSena ?? ''})`])
      )

      const materialesPorPrestamoId = new Map()
      itemsPrestados.forEach((pi) => {
        const nombre = nombrePorMaterialItemId.get(pi.materialItemId) ?? 'Material'
        const lista = materialesPorPrestamoId.get(pi.prestamoId) ?? []
        lista.push(nombre)
        materialesPorPrestamoId.set(pi.prestamoId, lista)
      })

      const lista = (Array.isArray(data) ? data : data.data ?? []).map((p) => ({
        id: p.id,
        ficha: p.ficha?.codigoFicha ?? p.ficha ?? '—',
        solicitante: p.solicitante?.nombre ?? p.usuario?.nombre ?? '—',
        motivo: p.motivo ?? '—',
        fechaInicio: p.fecha_inicio ?? p.fechaInicio ?? '—',
        fechaFin: p.fecha_fin ?? p.fechaFin ?? '—',
        estado: p.estado ?? '—',
        materiales: materialesPorPrestamoId.get(p.id) ?? [],
      }))
      setPrestamos(lista)
    } catch {
      toast.error('Error al cargar los préstamos')
    }
  }

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return prestamos.filter((p) => {
      const coincide = p.ficha.toLowerCase().includes(q) || p.solicitante.toLowerCase().includes(q)
      const estado = !filtroEstado || p.estado.toLowerCase() === filtroEstado
      return coincide && estado
    })
  }, [prestamos, busqueda, filtroEstado])

  const paginados = useMemo(() => {
    const inicio = (pagina - 1) * POR_PAGINA
    return filtrados.slice(inicio, inicio + POR_PAGINA)
  }, [filtrados, pagina])

  const ejecutarAccion = async () => {
    if (!accionPendiente) return
    const { tipo, prestamo } = accionPendiente
    try {
      if (tipo === 'aprobar') {
        const payload = {}
        if (consumiblesPrestamo.length > 0) {
          payload.cantidadesAprobadas = consumiblesPrestamo.map((c) => ({
            prestamoConsumibleId: c.id,
            cantidadAprobada: Number(cantidadesAprobadas[c.id] ?? c.cantidadSolicitada ?? c.cantidad ?? 0),
          }))
        }
        await prestamosService.aprobar(prestamo.id, payload)
      } else if (tipo === 'rechazar') {
        await prestamosService.rechazar(prestamo.id, motivoRechazo.trim() || 'Sin motivo especificado')
      } else if (tipo === 'entregar') {
        await prestamosService.entregar(prestamo.id)
      } else if (tipo === 'devolver') {
        await prestamosService.devolver(prestamo.id)
      }
      toast.success(
        tipo === 'aprobar' ? 'Préstamo aprobado correctamente' :
        tipo === 'rechazar' ? 'Préstamo rechazado' :
        tipo === 'entregar' ? 'Entrega registrada' :
        'Devolución registrada'
      )
      setAccionPendiente(null)
      setMotivoRechazo('')
      cargar()
    } catch {
      toast.error('Error al procesar la acción')
      setAccionPendiente(null)
      setMotivoRechazo('')
    }
  }

  const abrirDetalle = async (p) => {
    setDetalle(p)
    setHistorial([])
    setHistorialCargando(true)
    try {
      const data = await prestamosService.getHistorial(p.id)
      setHistorial(Array.isArray(data) ? data : [])
    } catch {
      setHistorial([])
    } finally {
      setHistorialCargando(false)
    }
  }

  const exportar = () => {
    const filas = filtrados.map((p) => ({
      Ficha:           p.ficha,
      Solicitante:     p.solicitante,
      Materiales:      p.materiales.join(', ') || '—',
      Motivo:          p.motivo,
      'Fecha Inicio':  p.fechaInicio,
      'Fecha Fin':     p.fechaFin,
      Estado:          p.estado,
    }))
    exportToExcel(filas, `prestamos-${new Date().toISOString().split('T')[0]}`, 'Préstamos')
  }

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 page-title">Gestión de Préstamos</h1>
              <p className="text-sm text-gray-500 mt-1">Revisa, aprueba y gestiona los préstamos de materiales.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportar}
                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                title="Exportar a Excel"
              >
                <FiDownload size={14} /> Exportar
              </button>
              <Boton variante="primario" className="flex items-center gap-2" onClick={() => navigate('/app/prestamos/nuevo')}>
                <FiPlus size={16} /> Nuevo Préstamo
              </Boton>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="flex-1 min-w-48">
              <SearchBar placeholder="Buscar por ficha o solicitante..." value={busqueda} onChange={(v) => { setBusqueda(v); setPagina(1) }} />
            </div>
            <div className="w-full sm:w-48">
              <SelectOpcion
                placeholder="Todos los estados"
                options={ESTADOS}
                value={filtroEstado}
                onChange={(e) => { setFiltroEstado(e.target.value); setPagina(1) }}
                name="filtroEstado"
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#39A900]">
                    {['Ficha', 'Solicitante', 'Material', 'Motivo', 'Fecha Inicio', 'Fecha Fin', 'Estado', 'Acciones'].map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginados.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No se encontraron préstamos</td></tr>
                  ) : (
                    paginados.map((p) => (
                      <tr key={p.id} className="hover:bg-[#39A900]/5 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{p.ficha}</td>
                        <td className="px-4 py-3 text-gray-700">{p.solicitante}</td>
                        <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{p.materiales.length > 0 ? p.materiales.join(', ') : '—'}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{p.motivo}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{p.fechaInicio}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{p.fechaFin}</td>
                        <td className="px-4 py-3">
                          <Badge variante={badgeEstado(p.estado)}>{p.estado}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => abrirDetalle(p)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md" title="Ver"><FiEye size={14} /></button>
                            {p.estado.toLowerCase() === 'pendiente' && (
                              <>
                                <button onClick={() => setAccionPendiente({ tipo: 'aprobar', prestamo: p })} className="p-1.5 text-green-600 hover:bg-green-50 rounded-md" title="Aprobar"><FiCheck size={14} /></button>
                                <button onClick={() => setAccionPendiente({ tipo: 'rechazar', prestamo: p })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md" title="Rechazar"><FiX size={14} /></button>
                              </>
                            )}
                            {p.estado.toLowerCase() === 'aprobado' && (
                              <button onClick={() => setAccionPendiente({ tipo: 'entregar', prestamo: p })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md" title="Entregar"><FiTruck size={14} /></button>
                            )}
                            {(p.estado.toLowerCase() === 'activo' || p.estado.toLowerCase() === 'entregado') && (
                              <button onClick={() => setAccionPendiente({ tipo: 'devolver', prestamo: p })} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md" title="Devolver"><FiRotateCcw size={14} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Mostrando {Math.min((pagina - 1) * POR_PAGINA + 1, filtrados.length)} a {Math.min(pagina * POR_PAGINA, filtrados.length)} de {filtrados.length} préstamos</p>
              <div className="flex gap-2">
                <button onClick={() => setPagina(p => p - 1)} disabled={pagina <= 1} className="px-4 py-1.5 text-sm rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Anterior</button>
                <button onClick={() => setPagina(p => p + 1)} disabled={pagina * POR_PAGINA >= filtrados.length} className="px-4 py-1.5 text-sm rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Siguiente</button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* Modal confirmación de acción */}
      {accionPendiente && (
        <ModalConfirmacion
          titulo={
            accionPendiente.tipo === 'aprobar' ? 'Aprobar préstamo'
            : accionPendiente.tipo === 'rechazar' ? 'Rechazar préstamo'
            : accionPendiente.tipo === 'entregar' ? 'Marcar como entregado'
            : 'Registrar devolución'
          }
          textoConfirmar={
            accionPendiente.tipo === 'aprobar' ? 'Aprobar'
            : accionPendiente.tipo === 'rechazar' ? 'Rechazar'
            : accionPendiente.tipo === 'entregar' ? 'Entregar'
            : 'Devolver'
          }
          variante={accionPendiente.tipo === 'rechazar' ? 'peligro' : 'exito'}
          mensaje={`¿Confirmas ${accionPendiente.tipo === 'aprobar' ? 'aprobar' : accionPendiente.tipo === 'rechazar' ? 'rechazar' : accionPendiente.tipo === 'entregar' ? 'marcar como entregado' : 'registrar devolución de'} el préstamo de "${accionPendiente.prestamo.solicitante}"?`}
          onConfirmar={ejecutarAccion}
          onCancelar={() => { setAccionPendiente(null); setMotivoRechazo('') }}
        >
          {accionPendiente.tipo === 'rechazar' && (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Motivo del rechazo <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Ej: El material solicitado no está disponible en este momento..."
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 resize-none outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/15 transition-all"
              />
            </div>
          )}

          {accionPendiente.tipo === 'aprobar' && consumiblesPrestamo.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Cantidades aprobadas por consumible:</p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Material</th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-600">Solicitado</th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-600">Aprobar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {consumiblesPrestamo.map((c) => (
                      <tr key={c.id}>
                        <td className="px-3 py-2 text-gray-700">
                          {c.materialConsumible?.materiale?.nombre ?? c.nombre ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-center text-gray-500">
                          {c.cantidadSolicitada ?? c.cantidad ?? 0}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            max={c.cantidadSolicitada ?? c.cantidad ?? 9999}
                            value={cantidadesAprobadas[c.id] ?? ''}
                            onChange={(e) =>
                              setCantidadesAprobadas((prev) => ({ ...prev, [c.id]: e.target.value }))
                            }
                            className="w-20 mx-auto block text-center border border-gray-300 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </ModalConfirmacion>
      )}

      {/* Modal detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetalle(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900">Detalle del Préstamo</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Ficha:</span> {detalle.ficha}</p>
              <p><span className="font-medium">Solicitante:</span> {detalle.solicitante}</p>
              <p><span className="font-medium">Material:</span> {detalle.materiales.length > 0 ? detalle.materiales.join(', ') : '—'}</p>
              <p><span className="font-medium">Motivo:</span> {detalle.motivo}</p>
              <p><span className="font-medium">Fecha inicio:</span> {detalle.fechaInicio}</p>
              <p><span className="font-medium">Fecha fin:</span> {detalle.fechaFin}</p>
              <div className="flex items-center gap-2"><span className="font-medium">Estado:</span><Badge variante={badgeEstado(detalle.estado)}>{detalle.estado}</Badge></div>
            </div>

            {/* Historial de estados */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Historial de estados</h4>
              {historialCargando ? (
                <p className="text-xs text-gray-400">Cargando historial...</p>
              ) : historial.length === 0 ? (
                <p className="text-xs text-gray-400">Sin movimientos registrados aún.</p>
              ) : (
                <ol className="relative border-l border-gray-200 space-y-4 ml-2">
                  {historial.map((h) => (
                    <li key={h.id} className="ml-4">
                      <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white bg-[#39A900]" />
                      <div className="flex items-center gap-2 flex-wrap">
                        {h.estadoAnterior && (
                          <Badge variante={badgeEstado(h.estadoAnterior)}>{h.estadoAnterior}</Badge>
                        )}
                        {h.estadoAnterior && <span className="text-gray-400 text-xs">→</span>}
                        <Badge variante={badgeEstado(h.estadoNuevo)}>{h.estadoNuevo}</Badge>
                      </div>
                      <time className="text-xs text-gray-400 mt-0.5 block">
                        {new Date(h.creadoEn).toLocaleString('es-CO')}
                      </time>
                      {h.observacion && (
                        <p className="text-xs text-gray-500 mt-0.5 italic">"{h.observacion}"</p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Boton variante="secundario" onClick={() => setDetalle(null)}>Cerrar</Boton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
