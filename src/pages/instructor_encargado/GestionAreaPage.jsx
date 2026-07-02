import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMapPin, FiRepeat } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { Boton } from '@/components/atoms/Boton/Boton'
import { Badge } from '@/components/atoms/Badge/Badge'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import api from '@/services/api'

export default function GestionAreaPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [miArea, setMiArea] = useState(null)
  const [ubicaciones, setUbicaciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const areasRes = await api.get('/api/areas')
        const areas = areasRes.data?.data ?? areasRes.data ?? []
        const area = areas.find(
          (a) => a.encargado?.id === user?.id || String(a.FK_ID_Usuario) === String(user?.id)
        )
        setMiArea(area ?? null)

        if (area?.id) {
          const ubicRes = await api.get(`/api/areas/${area.id}/ubicaciones`).catch(() => ({ data: [] }))
          const lista = (ubicRes.data?.data ?? ubicRes.data ?? []).map((u) => ({
            id: u.id,
            nombre: u.nombre ?? '—',
            tipo: u.tipoUbicacion?.nombre ?? u.tipo ?? '—',
            estado: u.estado === true || u.estado === 1 || u.estado === 'activo' ? 'Activo' : 'Inactivo',
          }))
          setUbicaciones(lista)
        }
      } catch {
        toast.error('Error al cargar el área')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [user])

  if (cargando) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-gray-400">Cargando...</div>
      </DashboardLayout>
    )
  }

  if (!miArea) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto mt-10 p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
          No tienes un área asignada. Contacta al administrador.
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 page-title">Mi Área de Gestión</h1>
          <p className="text-sm text-gray-500 mt-1">Información y ubicaciones de tu área asignada.</p>
        </div>

        {/* Card del área */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 border-t-4 border-t-green-500">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-3">
              <FiMapPin size={22} className="text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Área Asignada
                </p>
                <h2 className="text-xl font-bold text-gray-900">{miArea.nombre ?? '—'}</h2>
                {miArea.descripcion && (
                  <p className="text-sm text-gray-500 mt-1">{miArea.descripcion}</p>
                )}
                {miArea.sede?.nombre && (
                  <p className="text-sm text-gray-500 mt-1">
                    Sede: <span className="font-medium">{miArea.sede.nombre}</span>
                  </p>
                )}
              </div>
            </div>
            <Boton
              variante="primario"
              className="flex items-center gap-2"
              onClick={() => navigate('/app/prestamos')}
            >
              <FiRepeat size={15} />
              Gestionar Préstamos
            </Boton>
          </div>
        </div>

        {/* Tabla de ubicaciones */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">
              Ubicaciones — {miArea.nombre}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#39A900]">
                  {['Nombre', 'Tipo', 'Estado'].map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ubicaciones.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-gray-400">
                      No hay ubicaciones registradas
                    </td>
                  </tr>
                ) : (
                  ubicaciones.map((u) => (
                    <tr key={u.id} className="hover:bg-[#39A900]/5 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-800">{u.nombre}</td>
                      <td className="px-5 py-4 text-gray-600">{u.tipo}</td>
                      <td className="px-5 py-4">
                        <Badge variante={u.estado === 'Activo' ? 'success' : 'default'}>
                          {u.estado}
                        </Badge>
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
  )
}
