import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { Breadcrumb } from '@/components/molecules/Breadcrumb/Breadcrumb'
import { Boton } from '@/components/atoms/Boton/Boton'
import { InputTexto } from '@/components/atoms/InputTexto/InputTexto'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { Textarea } from '@/components/atoms/Textarea/Textarea'
import { SelectorUnspsc } from '@/components/molecules/SelectorUnspsc/SelectorUnspsc'
import { InputFecha } from '@/components/atoms/InputFecha/InputFecha'
import { materialesService } from '@/services/materialesService'
import { movimientosService } from '@/services/movimientosService'
import { categoriasService } from '@/services/categoriasService'
import { fichasService } from '@/services/fichasService'
import { ubicacionesService } from '@/services/ubicacionesService'
import { areasService } from '@/services/areasService'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'

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

const ESTADOS_ITEM = [
  { value: 'BUENO', label: 'Bueno' },
  { value: 'REGULAR', label: 'Regular' },
  { value: 'MALO', label: 'Malo' },
  { value: 'DAÑADO', label: 'Dañado' },
]

const PASOS = ['Material base', 'Detalles', 'Movimiento inicial']

const Stepper = ({ pasoActual }) => (
  <div className="flex items-center gap-2 mb-8">
    {PASOS.map((label, i) => {
      const num = i + 1
      const activo = num === pasoActual
      const completado = num < pasoActual
      return (
        <div key={label} className="flex items-center gap-2 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
            completado ? 'bg-[#39A900] text-white' : activo ? 'bg-[#39A900] text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {completado ? '✓' : num}
          </div>
          <span className={`text-sm ${activo ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>{label}</span>
          {i < PASOS.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-2" />}
        </div>
      )
    })}
  </div>
)

export default function NuevoMaterialPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const usuarioActualId = user?.id

  const [paso, setPaso] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // Opciones para selects
  const [categorias, setCategorias] = useState([])
  const [fichas, setFichas] = useState([])
  const [ubicaciones, setUbicaciones] = useState([])
  // Mapa ubicacionId → usuarioLiderId del área
  const [encargadoPorUbicacion, setEncargadoPorUbicacion] = useState({})

  // Paso 1 — Material base
  const [base, setBase] = useState({
    nombre: '', descripcion: '', sku: '', marca: '', codigoUnspsc: null, tipo: 'item',
    categoriaMaterialId: '', fichaId: '', ubicacionId: '',
  })

  const esItem = base.tipo === 'item'

  // Paso 2 — Item (lote)
  const [item, setItem] = useState({
    codigoBase: '', cantidad: '1', condicion: '', estadoItem: 'BUENO', observacion: '',
  })

  // Paso 2 — Consumible
  const [consumible, setConsumible] = useState({
    stockIngreso: '', stockMinimo: '', unidadMedida: '', fechaVencimiento: '',
  })

  // Usuario responsable (auto del área de la ubicación)
  const usuarioResponsableId = useMemo(
    () => encargadoPorUbicacion[base.ubicacionId] ?? null,
    [base.ubicacionId, encargadoPorUbicacion]
  )

  useEffect(() => {
    Promise.all([
      categoriasService.getAll(),
      fichasService.getAll(),
      ubicacionesService.getAll(),
      areasService.getAll(),
    ]).then(([cat, fic, ubi, areas]) => {
      setCategorias((Array.isArray(cat) ? cat : cat.data ?? []).map(c => ({ value: c.id, label: c.nombre })))
      setFichas((Array.isArray(fic) ? fic : fic.data ?? []).map(f => ({
        value: f.id,
        label: f.programa?.nombre ? `${f.codigoFicha} — ${f.programa.nombre}` : f.codigoFicha,
      })))

      const arrUbi = Array.isArray(ubi) ? ubi : ubi.data ?? []
      const arrAreas = Array.isArray(areas) ? areas : areas.data ?? []

      // Mapa areaId → usuarioLiderId
      const liderPorArea = {}
      arrAreas.forEach(a => { if (a.usuarioLider?.id) liderPorArea[a.id] = a.usuarioLider.id })

      // Mapa ubicacionId → usuarioLiderId (a través del área)
      const encargado = {}
      arrUbi.forEach(u => { if (u.area?.id) encargado[u.id] = liderPorArea[u.area.id] ?? null })

      setEncargadoPorUbicacion(encargado)
      setUbicaciones(arrUbi.map(u => ({ value: u.id, label: u.nombre })))
    }).catch(() => toast.error('Error al cargar opciones'))
  }, [])

  const validarPaso1 = () => {
    if (!base.nombre.trim()) return 'El nombre es obligatorio.'
    if (!base.descripcion.trim()) return 'La descripción es obligatoria.'
    if (!esItem && !base.sku.trim()) return 'El SKU es obligatorio para consumibles.'
    if (!base.categoriaMaterialId) return 'Selecciona una categoría.'
    if (!base.fichaId) return 'Selecciona una ficha.'
    return ''
  }

  const validarPaso2 = () => {
    if (esItem) {
      if (!item.codigoBase.trim()) return 'El código base es obligatorio.'
      if (!item.cantidad || Number(item.cantidad) < 1) return 'La cantidad debe ser al menos 1.'
      if (!item.condicion.trim()) return 'La condición es obligatoria.'
    } else {
      if (!consumible.stockIngreso || Number(consumible.stockIngreso) <= 0) return 'El stock de ingreso debe ser mayor a 0.'
      if (consumible.stockMinimo === '') return 'El stock mínimo es obligatorio.'
      if (!consumible.unidadMedida.trim()) return 'La unidad de medida es obligatoria.'
    }
    return ''
  }

  const validarPaso3 = () => {
    const cant = esItem ? Number(item.cantidad) : Number(consumible.stockIngreso)
    if (!cant || cant <= 0) return 'La cantidad debe ser mayor a 0.'
    return ''
  }

  const siguiente = () => {
    const err = paso === 1 ? validarPaso1() : paso === 2 ? validarPaso2() : ''
    if (err) return setError(err)
    setError('')
    setPaso(p => p + 1)
  }

  const guardar = async () => {
    const err = validarPaso3()
    if (err) return setError(err)
    setCargando(true)
    try {
      // Paso 1: material base
      const material = await materialesService.crear({
        nombre: base.nombre.trim(),
        descripcion: base.descripcion.trim(),
        ...(!esItem && base.sku ? { sku: base.sku.trim() } : {}),
        ...(base.codigoUnspsc ? { codigoUnspsc: base.codigoUnspsc } : {}),
        tipo: base.tipo,
        categoriaMaterialId: base.categoriaMaterialId,
        fichaId: base.fichaId,
        ...(base.ubicacionId ? { ubicacionId: base.ubicacionId } : {}),
      })
      const materialeId = material?.id ?? material?.data?.id

      // Paso 2: items en lote o consumible
      const ids = { materialItemId: undefined, materialConsumibleId: undefined }

      if (esItem) {
        const total = Number(item.cantidad)
        const codigos = Array.from({ length: total }, (_, i) =>
          total === 1 ? item.codigoBase.trim() : `${item.codigoBase.trim()}-${String(i + 1).padStart(3, '0')}`
        )
        // Crear todos en paralelo
        const resultados = await Promise.all(
          codigos.map(codigo =>
            materialesService.crearItem({
              codigoSena: codigo,
              condicion: item.condicion.trim(),
              estadoItem: item.estadoItem,
              ...(item.observacion ? { observacion: item.observacion.trim() } : {}),
              materialeId,
              ...(usuarioResponsableId ? { usuarioId: usuarioResponsableId } : {}),
            })
          )
        )
        // Para el movimiento usamos el primer item
        ids.materialItemId = resultados[0]?.id ?? resultados[0]?.data?.id
      } else {
        const res = await materialesService.crearConsumible({
          stockIngreso: Number(consumible.stockIngreso),
          stockMinimo: Number(consumible.stockMinimo),
          unidadMedida: consumible.unidadMedida.trim(),
          ...(consumible.fechaVencimiento ? { fechaVencimiento: consumible.fechaVencimiento } : {}),
          materialeId,
          ...(usuarioResponsableId ? { usuarioId: usuarioResponsableId } : {}),
        })
        ids.materialConsumibleId = res?.id ?? res?.data?.id
      }

      // Paso 3: movimiento de ENTRADA solo para ítems (consumibles ya tienen su movimiento inicial en el backend)
      if (esItem && ids.materialItemId) {
        await movimientosService.crear({
          tipo: 'ENTRADA',
          cantidad: Number(item.cantidad),
          descripcion: `Ingreso inicial: ${base.nombre.trim()}`,
          materialItemId: ids.materialItemId,
          ...(usuarioActualId ? { usuarioId: usuarioActualId } : {}),
          ...(base.fichaId ? { fichaId: base.fichaId } : {}),
        })
      }

      toast.success(`Material registrado${esItem ? ` (${item.cantidad} ítem(s) creados)` : ''}`)
      navigate('/app/materiales')
    } catch (e) {
      const msg = e?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(' | ') : msg || 'Error al guardar el material.')
    } finally { setCargando(false) }
  }

  // Resumen del paso 3
  const cantidadFinal = esItem ? Number(item.cantidad) || 0 : Number(consumible.stockIngreso) || 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Materiales', to: '/app/materiales' }, { label: 'Nuevo Material' }]} />

        <div className="max-w-2xl mx-auto w-full">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 page-title">Crear Nuevo Material</h1>
            <p className="text-sm text-gray-500 mt-1">Completa los pasos para registrar el material en el inventario.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <Stepper pasoActual={paso} />

            {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

            {/* PASO 1 — Material base */}
            {paso === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputTexto label="Nombre *" value={base.nombre} onChange={e => setBase({ ...base, nombre: e.target.value })} placeholder="Ej: Taladro percutor" />
                  {!esItem && (
                    <InputTexto label="SKU *" value={base.sku} onChange={e => setBase({ ...base, sku: e.target.value })} placeholder="Ej: TAL-001" />
                  )}
                  <InputTexto label="Marca" value={base.marca} onChange={e => setBase({ ...base, marca: e.target.value })} placeholder="Ej: Bosch" />
                  <SelectorUnspsc
                    value={base.codigoUnspsc}
                    onChange={item => setBase({ ...base, codigoUnspsc: item?.codigo ?? null })}
                  />
                </div>
                <Textarea label="Descripción *" value={base.descripcion} onChange={e => setBase({ ...base, descripcion: e.target.value })} placeholder="Descripción del material..." rows={2} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectOpcion label="Categoría *" placeholder="Selecciona una categoría" options={categorias} value={base.categoriaMaterialId} onChange={e => setBase({ ...base, categoriaMaterialId: e.target.value })} name="categoria" />
                  <SelectOpcion label="Ficha *" placeholder="Selecciona una ficha" options={fichas} value={base.fichaId} onChange={e => setBase({ ...base, fichaId: e.target.value })} name="ficha" />
                  <SelectOpcion label="Ubicación" placeholder="Selecciona una ubicación (opcional)" options={ubicaciones} value={base.ubicacionId} onChange={e => setBase({ ...base, ubicacionId: e.target.value })} name="ubicacion" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Tipo *</label>
                  <div className="flex gap-6 mt-2">
                    {[{ value: 'item', label: 'No consumible' }, { value: 'consumible', label: 'Consumible' }].map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value={opt.value} checked={base.tipo === opt.value} onChange={() => setBase({ ...base, tipo: opt.value })} className="accent-green-600" />
                        <span className="text-sm text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2A — Items en lote */}
            {paso === 2 && esItem && (
              <div className="space-y-4">
                <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
                  Si ingresas varios ítems, el sistema generará los códigos automáticamente: <strong>CODIGO-001</strong>, <strong>CODIGO-002</strong>…
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputTexto label="Código base *" value={item.codigoBase} onChange={e => setItem({ ...item, codigoBase: e.target.value })} placeholder="Ej: SENA-TAL" />
                  <InputTexto label="Cantidad a ingresar *" type="number" min="1" value={item.cantidad} onChange={e => setItem({ ...item, cantidad: e.target.value })} placeholder="Ej: 30" />
                  <InputTexto label="Condición *" value={item.condicion} onChange={e => setItem({ ...item, condicion: e.target.value })} placeholder="Ej: Nuevo" />
                  <SelectOpcion label="Estado *" options={ESTADOS_ITEM} value={item.estadoItem} onChange={e => setItem({ ...item, estadoItem: e.target.value })} name="estadoItem" />
                </div>
                <InputTexto label="Observación" value={item.observacion} onChange={e => setItem({ ...item, observacion: e.target.value })} placeholder="Sin novedad" />
              </div>
            )}

            {/* PASO 2B — Consumible */}
            {paso === 2 && !esItem && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputTexto label="Stock de Ingreso *" type="number" min="1" value={consumible.stockIngreso} onChange={e => setConsumible({ ...consumible, stockIngreso: e.target.value })} placeholder="Ej: 100" />
                  <InputTexto label="Stock Mínimo *" type="number" min="0" value={consumible.stockMinimo} onChange={e => setConsumible({ ...consumible, stockMinimo: e.target.value })} placeholder="Ej: 10" />
                  <SelectOpcion label="Unidad de Medida *" placeholder="Selecciona una unidad" options={UNIDADES_MEDIDA} value={consumible.unidadMedida} onChange={e => setConsumible({ ...consumible, unidadMedida: e.target.value })} name="unidadMedida" />
                  <InputFecha label="Fecha de Vencimiento" name="fechaVencimiento" value={consumible.fechaVencimiento} onChange={e => setConsumible({ ...consumible, fechaVencimiento: e.target.value })} />
                </div>
              </div>
            )}

            {/* PASO 3 — Resumen */}
            {paso === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-[#39A900] bg-green-50 border border-green-100 rounded-lg px-4 py-2">
                  {esItem
                    ? <>Se crearán <strong>{cantidadFinal} ítem(s)</strong> y se registrará un movimiento de <strong>ENTRADA</strong>.</>
                    : <>Se registrará el consumible con stock inicial de <strong>{cantidadFinal} {consumible.unidadMedida || 'unidad(es)'}</strong>. El movimiento de entrada se genera automáticamente.</>
                  }
                </p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between"><span className="font-medium">Material:</span><span>{base.nombre}</span></div>
                  <div className="flex justify-between"><span className="font-medium">Tipo:</span><span>{esItem ? 'Ítem' : 'Consumible'}</span></div>
                  {base.marca && <div className="flex justify-between"><span className="font-medium">Marca:</span><span>{base.marca}</span></div>}
                  {base.codigoUnspsc && <div className="flex justify-between"><span className="font-medium">Código UNSPSC:</span><span>{base.codigoUnspsc}</span></div>}
                  {esItem && <div className="flex justify-between"><span className="font-medium">Ítems a crear:</span><span>{item.cantidad} ({item.codigoBase}-001… )</span></div>}
                  <div className="flex justify-between"><span className="font-medium">Registrado por:</span><span>{user?.nombre ?? '—'}</span></div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
              <Boton type="button" variante="secundario" onClick={() => paso === 1 ? navigate('/app/materiales') : (setPaso(p => p - 1), setError(''))}>
                {paso === 1 ? 'Cancelar' : '← Anterior'}
              </Boton>
              {paso < 3
                ? <Boton type="button" variante="primario" onClick={siguiente}>Siguiente →</Boton>
                : <Boton type="button" variante="primario" disabled={cargando} onClick={guardar}>{cargando ? 'Guardando...' : 'Confirmar y Guardar'}</Boton>
              }
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
