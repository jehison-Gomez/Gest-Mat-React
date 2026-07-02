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
import { FiCheck, FiX, FiTruck, FiRotateCcw, FiEye, FiPlus } from 'react-icons/fi'

const POR_PAGINA = 10

const badgeEstado = (estado) => {
  const e = (estado ?? '').toLowerCase()
  if (e === 'pendiente') return 'warning'
  if (e === 'aprobado') return 'info'
  if (e === 'entregado' || e === 'activo') return 'success'
  if (e === 'devuelto') return 'default'
  if (e === 'rechazado') return 'danger'
  if (e === 'vencido') return 'danger'
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

  useEffect(() => { cargar() }, [])

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
      if (tipo === 'aprobar') await prestamosService.aprobar(prestamo.id)
      else if (tipo === 'rechazar') await prestamosService.rechazar(prestamo.id, motivoRechazo.trim() || 'Sin motivo especificado')
      else if (tipo === 'entregar') await prestamosService.entregar(prestamo.id)
      else if (tipo === 'devolver') await prestamosService.devolver(prestamo.id)
      toast.success(`Préstamo ${tipo === 'aprobar' ? 'aprobado' : tipo === 'rechazar' ? 'rechazado' : tipo === 'entregar' ? 'entregado' : 'devuelto'} correctamente`)
      setAccionPendiente(null)
      setMotivoRechazo('')
      cargar()
    } catch {
      toast.error('Error al procesar la acción')
      setAccionPendiente(null)
      setMotivoRechazo('')
    }
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
            <Boton variante="primario" className="flex items-center gap-2" onClick={() => navigate('/app/prestamos/nuevo')}>
              <FiPlus size={16} /> Nuevo Préstamo
            </Boton>
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
                            <button onClick={() => setDetalle(p)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md" title="Ver"><FiEye size={14} /></button>
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
        </ModalConfirmacion>
      )}

      {/* Modal detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetalle(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 space-y-4">
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
            <div className="flex justify-end pt-2">
              <Boton variante="secundario" onClick={() => setDetalle(null)}>Cerrar</Boton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
