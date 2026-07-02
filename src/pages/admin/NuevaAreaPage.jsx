import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiAlertTriangle } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { FormularioArea } from '@/components/organisms/FormularioArea/FormularioArea'
import { Breadcrumb } from '@/components/molecules/Breadcrumb/Breadcrumb'
import { areasService } from '@/services/areasService'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import api from '@/services/api'

export default function NuevaAreaPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { sedeId: miSedeId, isSuperAdmin } = useAuth()
  const [cargando, setCargando] = useState(false)
  const [sedes, setSedes] = useState([])
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        const [sedesRes, usersRes] = await Promise.all([
          api.get('/api/sedes').catch(() => ({ data: [] })),
          api.get('/api/usuarios').catch(() => ({ data: [] })),
        ])
        setSedes((sedesRes.data?.data ?? sedesRes.data ?? []).map((s) => ({ value: String(s.id), label: s.nombre })))
        setUsuarios(
          (usersRes.data?.data ?? usersRes.data ?? [])
            .filter((u) => ['instructor', 'instructor_encargado'].includes(u.role?.nombre))
            .map((u) => ({ value: String(u.id), label: u.nombre }))
        )
      } catch {
        toast.error('Error al cargar opciones del formulario')
      }
    }
    cargarOpciones()
  }, [])

  const handleGuardar = async (data) => {
    setCargando(true)
    // Administrador usa siempre su propia sede; super_admin puede elegir
    const sedeId = isSuperAdmin ? data.sede : miSedeId
    try {
      await areasService.crear({
        nombre: data.nombre,
        descripcion: data.descripcion,
        sedeId,
        ...(data.encargado ? { usuarioLiderId: data.encargado } : {}),
        estado: data.activa ? 'activo' : 'inactivo',
      })
      toast.success('Área creada exitosamente')
      navigate('/app/areas')
    } catch {
      toast.error('Error al crear el área')
    } finally {
      setCargando(false)
    }
  }

  const sinSedeConfigurada = !isSuperAdmin && !miSedeId

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: 'Áreas y Ubicaciones', to: '/app/areas' },
            { label: 'Crear Nueva Área' },
          ]}
        />

        <div className="max-w-3xl w-full mx-auto space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 page-title">Crear Nueva Área</h1>
            <p className="text-sm text-gray-500 mt-1">
              Ingresa los detalles para registrar una nueva bodega, salón o taller en el sistema.
            </p>
          </div>

          {sinSedeConfigurada ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4">
              <FiAlertTriangle size={22} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-800">Sede no configurada</p>
                <p className="text-sm text-amber-700">
                  Tu cuenta de administrador no tiene una sede asignada. Para crear áreas,
                  solicita al <strong>super administrador</strong> que te asigne una sede
                  desde <em>Usuarios → Editar usuario</em>.
                </p>
              </div>
            </div>
          ) : (
            <FormularioArea
              sedes={sedes}
              sedeFija={isSuperAdmin ? null : miSedeId}
              usuarios={usuarios}
              onGuardar={handleGuardar}
              onCancelar={() => navigate('/app/areas')}
              cargando={cargando}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
