import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPackage, FiCalendar, FiPlus } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { Badge } from '@/components/atoms/Badge/Badge'
import { Boton } from '@/components/atoms/Boton/Boton'
import { prestamosService } from '@/services/prestamosService'
import { useToast } from '@/hooks/useToast'

export default function MisAsignacionesPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [materiales, setMateriales] = useState([])
  const [proximaDevolucion, setProximaDevolucion] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await prestamosService.getMios()
        const lista = (Array.isArray(data) ? data : data.data ?? [])
        const activos = lista.filter((p) => ['activo', 'aprobado'].includes((p.estado ?? '').toLowerCase()))

        const mats = activos.flatMap((p) =>
          (p.materiales ?? []).map((m) => ({
            nombre: m.nombre ?? m.material ?? '—',
            tipo: m.tipo ?? m.categoria ?? '—',
            cantidad: m.cantidad ?? 1,
            fechaDevolucion: p.fecha_fin ?? p.fechaFin ?? '—',
          }))
        )
        setMateriales(mats)

        const fechas = activos.map((p) => p.fecha_fin ?? p.fechaFin).filter(Boolean).sort()
        setProximaDevolucion(fechas[0] ?? null)
      } catch {
        toast.error('Error al cargar tus asignaciones')
      }
    }
    cargar()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 page-title">Mis Asignaciones</h1>
            <p className="text-sm text-gray-500 mt-1">Materiales asignados a ti en préstamos activos.</p>
          </div>
          <Boton
            variante="primario"
            className="flex items-center gap-2"
            onClick={() => navigate('/app/prestamos/nuevo')}
          >
            <FiPlus size={16} />
            Solicitar Préstamo
          </Boton>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <FiPackage size={22} className="text-[#39A900]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Materiales Activos</p>
              <p className="text-2xl font-bold text-gray-900 page-title">{materiales.length}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FiCalendar size={22} className="text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Próxima Devolución</p>
              <p className="text-xl font-bold text-gray-900">{proximaDevolucion ?? 'Sin fecha'}</p>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Materiales Asignados</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#39A900]">
                  {['Material', 'Tipo', 'Cantidad', 'Fecha Devolución'].map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {materiales.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">No tienes materiales asignados actualmente</td></tr>
                ) : (
                  materiales.map((m, i) => (
                    <tr key={i} className="hover:bg-[#39A900]/5 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-900">{m.nombre}</td>
                      <td className="px-5 py-4 text-gray-600">{m.tipo}</td>
                      <td className="px-5 py-4 font-semibold text-gray-900">{m.cantidad}</td>
                      <td className="px-5 py-4 text-gray-500">{m.fechaDevolucion}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
