import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { FormularioArea } from '@/components/organisms/FormularioArea/FormularioArea'
import { Breadcrumb } from '@/components/molecules/Breadcrumb/Breadcrumb'
import { areasService } from '@/services/areasService'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import api from '@/services/api'

export default function EditarAreaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { sedeId: miSedeId, isSuperAdmin } = useAuth()
  const [cargando, setCargando] = useState(false)
  const [sedes, setSedes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [valoresIniciales, setValoresIniciales] = useState({})

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [sedesRes, usersRes, areaRes] = await Promise.all([
          api.get('/api/sedes').catch(() => ({ data: [] })),
          api.get('/api/usuarios').catch(() => ({ data: [] })),
          areasService.getById(id),
        ])
        setSedes((sedesRes.data?.data ?? sedesRes.data ?? []).map((s) => ({ value: String(s.id), label: s.nombre })))
        setUsuarios(
          (usersRes.data?.data ?? usersRes.data ?? [])
            .filter((u) => ['instructor', 'instructor_encargado'].includes(u.role?.nombre))
            .map((u) => ({ value: String(u.id), label: u.nombre }))
        )

        const a = areaRes?.data ?? areaRes
        setValoresIniciales({
          nombre: a.nombre ?? '',
          descripcion: a.descripcion ?? '',
          sede: String(a.sedeId ?? a.sede?.id ?? ''),
          encargado: String(a.usuarioLiderId ?? a.usuarioLider?.id ?? ''),
          activa: a.estado === 'activo',
        })
      } catch {
        toast.error('Error al cargar el área')
        navigate('/app/areas')
      }
    }
    cargarDatos()
  }, [id])

  const handleGuardar = async (data) => {
    setCargando(true)
    const sedeId = isSuperAdmin ? data.sede : miSedeId
    try {
      await areasService.actualizar(id, {
        nombre: data.nombre,
        descripcion: data.descripcion,
        ...(sedeId ? { sedeId } : {}),
        ...(data.encargado ? { usuarioLiderId: data.encargado } : {}),
        estado: data.activa ? 'activo' : 'inactivo',
      })
      toast.success('Área actualizada exitosamente')
      navigate('/app/areas')
    } catch {
      toast.error('Error al actualizar el área')
    } finally {
      setCargando(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: 'Áreas y Ubicaciones', to: '/app/areas' },
            { label: 'Editar Área' },
          ]}
        />

        <div className="max-w-3xl mx-auto w-full space-y-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 page-title">Editar Área</h1>
            <p className="text-sm text-gray-500 mt-1">
              Modifica los datos del área seleccionada.
            </p>
          </div>

          <FormularioArea
            modo="editar"
            valoresIniciales={valoresIniciales}
            sedes={sedes}
            sedeFija={isSuperAdmin ? null : miSedeId}
            usuarios={usuarios}
            onGuardar={handleGuardar}
            onCancelar={() => navigate('/app/areas')}
            cargando={cargando}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
