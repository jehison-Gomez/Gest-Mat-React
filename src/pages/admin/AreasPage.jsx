import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { TablaAreas } from '@/components/organisms/TablaAreas/TablaAreas'
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar'
import { ModalConfirmacion } from '@/components/molecules/ModalConfirmacion/ModalConfirmacion'
import { Boton } from '@/components/atoms/Boton/Boton'
import { areasService } from '@/services/areasService'
import { useToast } from '@/hooks/useToast'

const POR_PAGINA = 10

export default function AreasPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [areas, setAreas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [areaAEliminar, setAreaAEliminar] = useState(null)

  useEffect(() => {
    cargarAreas()
  }, [])

  const cargarAreas = async () => {
    try {
      const data = await areasService.getAll()
      const lista = (Array.isArray(data) ? data : data.data ?? []).map((a) => ({
        id: a.id,
        nombre: a.nombre ?? '—',
        descripcion: a.descripcion ?? '—',
        sede: a.sede?.nombre ?? '—',
        encargado: a.usuarioLider?.nombre ?? '—',
        estado: a.estado === 'activo' ? 'Activo' : 'Inactivo',
      }))
      setAreas(lista)
    } catch {
      toast.error('Error al cargar las áreas')
    }
  }

  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase()
    return areas.filter((a) =>
      a.nombre.toLowerCase().includes(q) ||
      a.sede.toLowerCase().includes(q) ||
      a.encargado.toLowerCase().includes(q)
    )
  }, [areas, busqueda])

  const paginadas = useMemo(() => {
    const inicio = (pagina - 1) * POR_PAGINA
    return filtradas.slice(inicio, inicio + POR_PAGINA)
  }, [filtradas, pagina])

  const handleBusqueda = (valor) => {
    setBusqueda(valor)
    setPagina(1)
  }

  const confirmarEliminar = async () => {
    try {
      await areasService.eliminar(areaAEliminar.id)
      toast.success('Área eliminada')
      setAreaAEliminar(null)
      cargarAreas()
    } catch {
      toast.error('Error al eliminar el área')
      setAreaAEliminar(null)
    }
  }

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Título */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 page-title">Gestión de Áreas</h1>
              <p className="text-sm text-gray-500 mt-1">
                Administra las áreas y ambientes del sistema.
              </p>
            </div>
            <Boton
              variante="primario"
              className="flex items-center gap-2"
              onClick={() => navigate('/app/areas/nueva')}
            >
              <FiPlus size={16} />
              Nueva Área
            </Boton>
          </div>

          {/* Barra de herramientas */}
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar
              placeholder="Buscar por nombre, sede o encargado..."
              value={busqueda}
              onChange={handleBusqueda}
            />
          </div>

          {/* Tabla */}
          <TablaAreas
            areas={paginadas}
            totalRegistros={filtradas.length}
            paginaActual={pagina}
            porPagina={POR_PAGINA}
            onAnterior={() => setPagina((p) => p - 1)}
            onSiguiente={() => setPagina((p) => p + 1)}
            onEditar={(a) => navigate(`/app/areas/editar/${a.id}`)}
            onEliminar={(a) => setAreaAEliminar(a)}
          />
        </div>
      </DashboardLayout>

      {areaAEliminar && (
        <ModalConfirmacion
          mensaje={`¿Estás seguro de eliminar el área "${areaAEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onConfirmar={confirmarEliminar}
          onCancelar={() => setAreaAEliminar(null)}
        />
      )}
    </>
  )
}
