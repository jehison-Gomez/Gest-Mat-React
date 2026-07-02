import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { Breadcrumb } from '@/components/molecules/Breadcrumb/Breadcrumb'
import { Boton } from '@/components/atoms/Boton/Boton'
import { InputTexto } from '@/components/atoms/InputTexto/InputTexto'
import { InputFecha } from '@/components/atoms/InputFecha/InputFecha'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { Textarea } from '@/components/atoms/Textarea/Textarea'
import { materialesService } from '@/services/materialesService'
import { categoriasService } from '@/services/categoriasService'
import { fichasService } from '@/services/fichasService'
import { ubicacionesService } from '@/services/ubicacionesService'
import { useToast } from '@/hooks/useToast'

const UNIDADES_MEDIDA = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'paca', label: 'Paca' },
  { value: 'caja', label: 'Caja' },
  { value: 'bolsa', label: 'Bolsa' },
  { value: 'rollo', label: 'Rollo' },
  { value: 'litro', label: 'Litro' },
  { value: 'galon', label: 'Galón' },
  { value: 'kg', label: 'Kilogramo (kg)' },
  { value: 'gramo', label: 'Gramo' },
  { value: 'metro', label: 'Metro' },
  { value: 'par', label: 'Par' },
  { value: 'resma', label: 'Resma' },
]

export default function EditarMaterialPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const [categorias, setCategorias] = useState([])
  const [fichas, setFichas] = useState([])
  const [ubicaciones, setUbicaciones] = useState([])

  const [consumibleId, setConsumibleId] = useState(null)

  const [base, setBase] = useState({
    nombre: '', descripcion: '', sku: '', tipo: 'item',
    categoriaMaterialId: '', fichaId: '', ubicacionId: '', estado: 'activo',
  })

  const [consumible, setConsumible] = useState({
    stockActual: '', stockMinimo: '', unidadMedida: '', fechaVencimiento: '',
  })

  const esItem = base.tipo === 'item'

  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      try {
        const [mat, cat, fic, ubi, allCons] = await Promise.all([
          materialesService.getById(id),
          categoriasService.getAll(),
          fichasService.getAll(),
          ubicacionesService.getAll(),
          materialesService.getAllConsumibles().catch(() => []),
        ])

        setCategorias((Array.isArray(cat) ? cat : cat.data ?? []).map(c => ({ value: String(c.id), label: c.nombre })))
        setFichas((Array.isArray(fic) ? fic : fic.data ?? []).map(f => ({ value: String(f.id), label: f.codigoFicha })))
        setUbicaciones((Array.isArray(ubi) ? ubi : ubi.data ?? []).map(u => ({ value: String(u.id), label: u.nombre })))

        const m = Array.isArray(mat) ? mat[0] : mat
        setBase({
          nombre: m.nombre ?? '',
          descripcion: m.descripcion ?? '',
          sku: m.sku ?? '',
          tipo: m.tipo ?? 'item',
          categoriaMaterialId: String(m.categoriaMaterial?.id ?? m.categoriaMaterialId ?? ''),
          fichaId: String(m.ficha?.id ?? m.fichaId ?? ''),
          ubicacionId: String(m.ubicacion?.id ?? m.ubicacionId ?? ''),
          estado: m.estado ?? 'activo',
        })

        if (m.tipo === 'consumible') {
          const arrCons = Array.isArray(allCons) ? allCons : allCons.data ?? []
          const cons = arrCons.find(c => (c.materiale?.id ?? c.materialeId) === m.id)
          if (cons) {
            setConsumibleId(cons.id)
            setConsumible({
              stockActual: String(cons.stockActual ?? ''),
              stockMinimo: String(cons.stockMinimo ?? ''),
              unidadMedida: cons.unidadMedida ?? '',
              fechaVencimiento: cons.fechaVencimiento ? cons.fechaVencimiento.split('T')[0] : '',
            })
          }
        }
      } catch {
        toast.error('Error al cargar el material')
        navigate('/app/materiales')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  const validar = () => {
    if (!base.nombre.trim()) return 'El nombre es obligatorio.'
    if (!base.descripcion.trim()) return 'La descripción es obligatoria.'
    if (!esItem && !base.sku.trim()) return 'El SKU es obligatorio para consumibles.'
    if (!base.categoriaMaterialId) return 'Selecciona una categoría.'
    if (!base.fichaId) return 'Selecciona una ficha.'
    if (!esItem) {
      if (consumible.stockActual === '' || Number(consumible.stockActual) < 0) return 'El stock actual es inválido.'
      if (consumible.stockMinimo === '') return 'El stock mínimo es obligatorio.'
      if (!consumible.unidadMedida) return 'La unidad de medida es obligatoria.'
    }
    return ''
  }

  const handleGuardar = async () => {
    const err = validar()
    if (err) return setError(err)
    setError('')
    setGuardando(true)
    try {
      await materialesService.actualizar(id, {
        nombre: base.nombre.trim(),
        descripcion: base.descripcion.trim(),
        ...(!esItem && base.sku ? { sku: base.sku.trim() } : {}),
        tipo: base.tipo,
        categoriaMaterialId: base.categoriaMaterialId,
        fichaId: base.fichaId,
        ...(base.ubicacionId ? { ubicacionId: base.ubicacionId } : {}),
        estado: base.estado,
      })

      if (!esItem && consumibleId) {
        await materialesService.actualizarConsumible(consumibleId, {
          stockActual: Number(consumible.stockActual),
          stockMinimo: Number(consumible.stockMinimo),
          unidadMedida: consumible.unidadMedida,
          ...(consumible.fechaVencimiento ? { fechaVencimiento: consumible.fechaVencimiento } : {}),
        })
      }

      toast.success('Material actualizado exitosamente')
      navigate('/app/materiales')
    } catch (e) {
      const msg = e?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(' | ') : msg || 'Error al actualizar el material.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-gray-500">Cargando material...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Materiales', to: '/app/materiales' }, { label: 'Editar Material' }]} />

        <div className="max-w-2xl mx-auto w-full">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 page-title">Editar Material</h1>
            <p className="text-sm text-gray-500 mt-1">Modifica los datos del material en el inventario.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
            )}

            {/* Datos base */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Datos del material</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputTexto
                  label="Nombre *"
                  value={base.nombre}
                  onChange={e => setBase({ ...base, nombre: e.target.value })}
                  placeholder="Ej: Taladro percutor"
                />
                {!esItem && (
                  <InputTexto
                    label="SKU *"
                    value={base.sku}
                    onChange={e => setBase({ ...base, sku: e.target.value })}
                    placeholder="Ej: TAL-001"
                  />
                )}
              </div>
              <Textarea
                label="Descripción *"
                value={base.descripcion}
                onChange={e => setBase({ ...base, descripcion: e.target.value })}
                placeholder="Descripción del material..."
                rows={2}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectOpcion
                  label="Categoría *"
                  placeholder="Selecciona una categoría"
                  options={categorias}
                  value={base.categoriaMaterialId}
                  onChange={e => setBase({ ...base, categoriaMaterialId: e.target.value })}
                  name="categoria"
                />
                <SelectOpcion
                  label="Ficha *"
                  placeholder="Selecciona una ficha"
                  options={fichas}
                  value={base.fichaId}
                  onChange={e => setBase({ ...base, fichaId: e.target.value })}
                  name="ficha"
                />
                <SelectOpcion
                  label="Ubicación"
                  placeholder="Selecciona una ubicación (opcional)"
                  options={ubicaciones}
                  value={base.ubicacionId}
                  onChange={e => setBase({ ...base, ubicacionId: e.target.value })}
                  name="ubicacion"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <div className="flex gap-6 mt-2">
                  {[
                    { value: 'item', label: 'No consumible' },
                    { value: 'consumible', label: 'Consumible' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={opt.value}
                        checked={base.tipo === opt.value}
                        onChange={() => setBase({ ...base, tipo: opt.value })}
                        className="accent-green-600"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <div className="flex gap-6 mt-2">
                  {[
                    { value: 'activo',   label: 'Activo'   },
                    { value: 'inactivo', label: 'Inactivo' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={opt.value}
                        checked={base.estado === opt.value}
                        onChange={() => setBase({ ...base, estado: opt.value })}
                        className="accent-green-600"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Datos del consumible */}
            {!esItem && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Stock del consumible</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputTexto
                    label="Stock Actual *"
                    type="number"
                    min="0"
                    value={consumible.stockActual}
                    onChange={e => setConsumible({ ...consumible, stockActual: e.target.value })}
                    placeholder="Ej: 100"
                  />
                  <InputTexto
                    label="Stock Mínimo *"
                    type="number"
                    min="0"
                    value={consumible.stockMinimo}
                    onChange={e => setConsumible({ ...consumible, stockMinimo: e.target.value })}
                    placeholder="Ej: 10"
                  />
                  <SelectOpcion
                    label="Unidad de Medida *"
                    placeholder="Selecciona una unidad"
                    options={UNIDADES_MEDIDA}
                    value={consumible.unidadMedida}
                    onChange={e => setConsumible({ ...consumible, unidadMedida: e.target.value })}
                    name="unidadMedida"
                  />
                  <InputFecha
                    label="Fecha de Vencimiento"
                    name="fechaVencimiento"
                    value={consumible.fechaVencimiento}
                    onChange={e => setConsumible({ ...consumible, fechaVencimiento: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <Boton type="button" variante="secundario" onClick={() => navigate('/app/materiales')}>
                Cancelar
              </Boton>
              <Boton type="button" variante="primario" disabled={guardando} onClick={handleGuardar}>
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </Boton>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
