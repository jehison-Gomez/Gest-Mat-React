import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { TablaMateriales } from '@/components/organisms/TablaMateriales/TablaMateriales'
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar'
import { ModalConfirmacion } from '@/components/molecules/ModalConfirmacion/ModalConfirmacion'
import { RegistrarProductoModal } from '@/components/organisms/RegistrarProductoModal/RegistrarProductoModal'
import { Boton } from '@/components/atoms/Boton/Boton'
import { Badge } from '@/components/atoms/Badge/Badge'
import { materialesService } from '@/services/materialesService'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'

const calcularEstado = (stockActual, stockMinimo) => {
  if (stockActual === 0) return 'SIN STOCK'
  if (stockActual <= stockMinimo) return 'STOCK BAJO'
  return 'DISPONIBLE'
}

export default function MaterialesPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { isAprendiz, isVocero, hasPermiso } = useAuth()
  const puedeCrear = !isAprendiz && !isVocero && hasPermiso('materiales', 'crear')
  const [materiales, setMateriales] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [confirmacion, setConfirmacion] = useState(false)
  const [materialAEliminar, setMaterialAEliminar] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    cargarMateriales()
  }, [])

  const cargarMateriales = async () => {
    try {
      const [matData, consData, itemData] = await Promise.all([
        materialesService.getAll(),
        materialesService.getAllConsumibles().catch(() => []),
        materialesService.getAllItems().catch(() => []),
      ])

      const arrCons = Array.isArray(consData) ? consData : consData.data ?? []
      const arrItems = Array.isArray(itemData) ? itemData : itemData.data ?? []

      // Mapas materialeId → datos
      const stockPorMaterial = {}
      arrCons.forEach(c => {
        stockPorMaterial[c.materiale?.id ?? c.materialeId] = {
          stockActual: c.stockActual ?? 0,
          stockMinimo: c.stockMinimo ?? 0,
        }
      })
      const itemsPorMaterial = {}
      const itemsTotalPorMaterial = {}
      arrItems.forEach(i => {
        const mid = i.materialeId ?? i.materiale?.id
        itemsTotalPorMaterial[mid] = (itemsTotalPorMaterial[mid] ?? 0) + 1
        if ((i.estado ?? '').toUpperCase() === 'DISPONIBLE') {
          itemsPorMaterial[mid] = (itemsPorMaterial[mid] ?? 0) + 1
        }
      })

      const lista = (Array.isArray(matData) ? matData : matData.data ?? []).map((m) => {
        const esConsumible = m.tipo === 'consumible'
        const stockActual = esConsumible
          ? (stockPorMaterial[m.id]?.stockActual ?? 0)
          : (itemsPorMaterial[m.id] ?? 0)
        const stockTotal = esConsumible
          ? stockActual
          : (itemsTotalPorMaterial[m.id] ?? 0)
        const stockMinimo = esConsumible
          ? (stockPorMaterial[m.id]?.stockMinimo ?? 0)
          : 0
        return {
          id: m.id,
          nombre: m.nombre,
          sku: m.sku ?? m.codigo ?? '—',
          tipo: m.tipo ?? '—',
          categoria: m.categoriaMaterial?.nombre ?? m.categoria?.nombre ?? '—',
          ubicacion: m.ubicacion?.nombre ?? '—',
          stockActual,
          stockTotal,
          stockMinimo,
          estado: calcularEstado(stockActual, stockMinimo),
        }
      })
      setMateriales(lista)
    } catch {
      toast.error('Error al cargar los materiales')
    }
  }

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return materiales.filter(
      (m) =>
        m.nombre.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        m.categoria.toLowerCase().includes(q) ||
        m.ubicacion.toLowerCase().includes(q)
    )
  }, [materiales, busqueda])

  const handleBusqueda = (valor) => {
    setBusqueda(valor)
  }

  const handleEliminar = (material) => {
    setMaterialAEliminar(material)
  }

  const confirmarEliminar = async () => {
    try {
      await materialesService.eliminar(materialAEliminar.id)
      toast.success('Material eliminado')
      setMaterialAEliminar(null)
      cargarMateriales()
    } catch {
      toast.error('Error al eliminar el material')
      setMaterialAEliminar(null)
    }
  }

  return (
    <>
    <DashboardLayout>
      <div className="space-y-6">
        {/* Título */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 page-title">Gestión de Materiales</h1>
            <p className="text-sm text-gray-500 mt-1">
              Administra el inventario y controla la trazabilidad de insumos.
            </p>
          </div>
          {puedeCrear && (
            <Boton
              variante="primario"
              className="flex items-center gap-2"
              onClick={() => setModalAbierto(true)}
            >
              <FiPlus size={16} />
              Nuevo Material
            </Boton>
          )}
        </div>

        {/* Barra de acciones */}
        <div className="flex items-center gap-4">
          <SearchBar
            placeholder="Buscar materiales, áreas o registros..."
            value={busqueda}
            onChange={handleBusqueda}
          />
          {confirmacion && (
            <Badge variante="success">Material creado exitosamente</Badge>
          )}
        </div>

        {/* Tabla */}
        <TablaMateriales
          materiales={filtrados}
          onEditar={(m) => navigate(`/app/materiales/editar/${m.id}`)}
          onHistorial={(m) => toast.info(`Historial: ${m.nombre}`)}
          onEliminar={handleEliminar}
        />
      </div>
    </DashboardLayout>

    {materialAEliminar && (
      <ModalConfirmacion
        mensaje={`¿Estás seguro de eliminar "${materialAEliminar.nombre}"? Esta acción no se puede deshacer.`}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setMaterialAEliminar(null)}
      />
    )}

    {modalAbierto && (
      <RegistrarProductoModal
        onCerrar={() => setModalAbierto(false)}
        onGuardado={() => { setModalAbierto(false); cargarMateriales() }}
      />
    )}
    </>
  )
}
