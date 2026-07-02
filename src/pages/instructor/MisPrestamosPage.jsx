import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiEye } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { Badge } from '@/components/atoms/Badge/Badge'
import { Boton } from '@/components/atoms/Boton/Boton'
import { prestamosService } from '@/services/prestamosService'
import { materialesService } from '@/services/materialesService'
import api from '@/services/api'
import { useToast } from '@/hooks/useToast'

const badgeEstado = (estado) => {
  const e = (estado ?? '').toLowerCase()
  if (e === 'pendiente') return 'warning'
  if (e === 'aprobado') return 'info'
  if (e === 'activo') return 'success'
  if (e === 'devuelto') return 'default'
  if (e === 'rechazado') return 'danger'
  return 'default'
}

export default function MisPrestamosPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [prestamos, setPrestamos] = useState([])
  const [detalle, setDetalle] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const [data, itemsPrestados, items] = await Promise.all([
          prestamosService.getMios(),
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
          motivo: p.motivo ?? '—',
          fechaInicio: p.fecha_inicio ?? p.fechaInicio ?? '—',
          fechaFin: p.fecha_fin ?? p.fechaFin ?? '—',
          estado: p.estado ?? '—',
          materiales: materialesPorPrestamoId.get(p.id) ?? [],
          observacion: p.observacion ?? '',
        }))
        setPrestamos(lista)
      } catch {
        toast.error('Error al cargar los préstamos')
      }
    }
    cargar()
  }, [])

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 page-title">Mis Préstamos</h1>
              <p className="text-sm text-gray-500 mt-1">Historial de solicitudes de préstamo realizadas.</p>
            </div>
            <Boton variante="primario" className="flex items-center gap-2" onClick={() => navigate('/app/prestamos/nuevo')}>
              <FiPlus size={16} /> Nuevo Préstamo
            </Boton>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#39A900]">
                    {['Ficha', 'Material', 'Motivo', 'Fecha Inicio', 'Fecha Devolución', 'Estado', 'Acciones'].map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {prestamos.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No tienes préstamos registrados</td></tr>
                  ) : (
                    prestamos.map((p) => (
                      <tr key={p.id} className="hover:bg-[#39A900]/5 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{p.ficha}</td>
                        <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{p.materiales.length > 0 ? p.materiales.join(', ') : '—'}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{p.motivo}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{p.fechaInicio}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{p.fechaFin}</td>
                        <td className="px-4 py-3"><Badge variante={badgeEstado(p.estado)}>{p.estado}</Badge></td>
                        <td className="px-4 py-3">
                          <button onClick={() => setDetalle(p)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md" title="Ver detalle">
                            <FiEye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetalle(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Detalle del Préstamo</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Ficha:</span> {detalle.ficha}</p>
              <p><span className="font-medium">Motivo:</span> {detalle.motivo}</p>
              <p><span className="font-medium">Fecha inicio:</span> {detalle.fechaInicio}</p>
              <p><span className="font-medium">Fecha devolución:</span> {detalle.fechaFin}</p>
              <div className="flex items-center gap-2"><span className="font-medium">Estado:</span><Badge variante={badgeEstado(detalle.estado)}>{detalle.estado}</Badge></div>
              {detalle.observacion && <p><span className="font-medium">Observación:</span> {detalle.observacion}</p>}
              {detalle.materiales.length > 0 && (
                <div>
                  <p className="font-medium mb-1">Materiales:</p>
                  <ul className="space-y-1 pl-4 list-disc">
                    {detalle.materiales.map((m, i) => (
                      <li key={i} className="text-gray-600">{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Boton variante="secundario" onClick={() => setDetalle(null)}>Cerrar</Boton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
