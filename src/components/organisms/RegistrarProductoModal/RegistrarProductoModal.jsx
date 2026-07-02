import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { InputTexto } from '@/components/atoms/InputTexto/InputTexto'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { Textarea } from '@/components/atoms/Textarea/Textarea'
import { Boton } from '@/components/atoms/Boton/Boton'
import { SelectorUnspsc } from '@/components/molecules/SelectorUnspsc/SelectorUnspsc'
import { InputFecha } from '@/components/atoms/InputFecha/InputFecha'
import { materialesService } from '@/services/materialesService'
import { movimientosService } from '@/services/movimientosService'
import { categoriasService } from '@/services/categoriasService'
import { fichasService } from '@/services/fichasService'
import { ubicacionesService } from '@/services/ubicacionesService'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const TIPOS = [
  { value: 'item',       label: 'DEVOLUTIVO', desc: 'Se devuelve tras el uso (equipos, herramientas)' },
  { value: 'consumible', label: 'CONSUMO',    desc: 'Se consume con el uso (insumos, papelería)' },
  { value: 'perecedero', label: 'PERECEDERO', desc: 'Consumible con fecha de vencimiento (alimentos, químicos)' },
]

const UNIDADES = [
  { value: 'unidad',  label: 'Unidad'  },
  { value: 'caja',    label: 'Caja'    },
  { value: 'bolsa',   label: 'Bolsa'   },
  { value: 'rollo',   label: 'Rollo'   },
  { value: 'paca',    label: 'Paca'    },
  { value: 'litro',   label: 'Litro'   },
  { value: 'galon',   label: 'Galón'   },
  { value: 'kg',      label: 'Kilogramo (kg)' },
  { value: 'gramo',   label: 'Gramo'   },
  { value: 'metro',   label: 'Metro'   },
  { value: 'par',     label: 'Par'     },
  { value: 'resma',   label: 'Resma'   },
]

const ESTADOS_ITEM = [
  { value: 'BUENO',   label: 'Bueno'   },
  { value: 'REGULAR', label: 'Regular' },
  { value: 'MALO',    label: 'Malo'    },
  { value: 'DAÑADO',  label: 'Dañado'  },
]

const generarSku = (nombre) =>
  nombre.trim().toUpperCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '')
    .substring(0, 20)

export const RegistrarProductoModal = ({ onCerrar, onGuardado }) => {
  const { user } = useAuth()
  const toast = useToast()

  const [categorias,  setCategorias]  = useState([])
  const [fichas,      setFichas]      = useState([])
  const [ubicaciones, setUbicaciones] = useState([])
  const [cargandoOpts, setCargandoOpts] = useState(true)

  const [form, setForm] = useState({
    nombre:              '',
    descripcion:         '',
    sku:                 '',
    skuManual:           false,
    codigoUnspsc:        null,
    tipo:                'item',
    unidadMedida:        'unidad',
    cantidad:            '1',
    stockMinimo:         '1',
    categoriaMaterialId: '',
    fichaId:             '',
    ubicacionId:         '',
    fechaVencimiento:    '',
    condicion:           'Nuevo',
    estadoItem:          'BUENO',
  })

  const [error,     setError]     = useState('')
  const [guardando, setGuardando] = useState(false)

  const esPerecedero  = form.tipo === 'perecedero'
  const esDevolutivo  = form.tipo === 'item'
  const esConsumible  = !esDevolutivo  // consumible o perecedero → material_consumible

  useEffect(() => {
    Promise.all([
      categoriasService.getAll(),
      fichasService.getAll(),
      ubicacionesService.getAll(),
    ]).then(([cat, fic, ubi]) => {
      setCategorias((Array.isArray(cat) ? cat : cat.data ?? []).map(c => ({ value: c.id, label: c.nombre })))
      setFichas((Array.isArray(fic) ? fic : fic.data ?? []).map(f => ({
        value: f.id,
        label: f.programa?.nombre ? `${f.codigoFicha} — ${f.programa.nombre}` : f.codigoFicha,
      })))
      setUbicaciones((Array.isArray(ubi) ? ubi : ubi.data ?? []).map(u => ({ value: u.id, label: u.nombre })))
    }).catch(() => toast.error('Error al cargar opciones')).finally(() => setCargandoOpts(false))
  }, [])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleNombre = (e) => {
    const nombre = e.target.value
    setForm(f => ({
      ...f,
      nombre,
      sku: f.skuManual ? f.sku : generarSku(nombre),
    }))
  }

  const handleSku = (e) => {
    const val = e.target.value
    setForm(f => ({ ...f, sku: val, skuManual: val !== '' }))
  }

  const handleTipo = (e) => {
    setForm(f => ({ ...f, tipo: e.target.value, fechaVencimiento: '' }))
  }

  const validar = () => {
    if (!form.nombre.trim())           return 'El nombre es obligatorio.'
    if (!form.categoriaMaterialId)     return 'Selecciona una categoría.'
    if (!form.fichaId)                 return 'Selecciona una ficha.'
    if (!form.cantidad || Number(form.cantidad) < 1) return 'La cantidad debe ser al menos 1.'
    if (esConsumible && !form.unidadMedida) return 'Selecciona una unidad de medida.'
    if (esPerecedero) {
      if (!form.fechaVencimiento)      return 'La fecha de vencimiento es obligatoria para materiales perecederos.'
      if (new Date(form.fechaVencimiento) <= new Date()) return 'La fecha de vencimiento debe ser una fecha futura.'
    }
    return ''
  }

  const handleGuardar = async () => {
    const err = validar()
    if (err) return setError(err)
    setError('')
    setGuardando(true)

    try {
      // 1. Crear material base (backend acepta 'item' o 'consumible')
      const tipoBackend = esDevolutivo ? 'item' : 'consumible'
      const skuFinal = form.sku.trim() || undefined

      const material = await materialesService.crear({
        nombre:              form.nombre.trim(),
        descripcion:         form.descripcion.trim() || form.nombre.trim(),
        tipo:                tipoBackend,
        categoriaMaterialId: form.categoriaMaterialId,
        fichaId:             form.fichaId,
        ...(skuFinal                ? { sku:           skuFinal }           : {}),
        ...(form.codigoUnspsc       ? { codigoUnspsc:  form.codigoUnspsc }  : {}),
        ...(form.ubicacionId        ? { ubicacionId:   form.ubicacionId }   : {}),
      })
      const materialeId = material?.id ?? material?.data?.id

      // 2. Crear ítems (DEVOLUTIVO) o consumible (CONSUMO/PERECEDERO)
      if (esDevolutivo) {
        const total   = Number(form.cantidad)
        const base    = generarSku(form.nombre).substring(0, 10)
        const codigos = Array.from({ length: total }, (_, i) =>
          total === 1 ? `${base}-001` : `${base}-${String(i + 1).padStart(3, '0')}`
        )
        const resultados = await Promise.all(
          codigos.map(codigo =>
            materialesService.crearItem({
              codigoSena: codigo,
              condicion:  form.condicion || 'Nuevo',
              estadoItem: form.estadoItem || 'BUENO',
              materialeId,
            })
          )
        )
        // Movimiento de ENTRADA para el primer ítem
        const primerItemId = resultados[0]?.id ?? resultados[0]?.data?.id
        if (primerItemId) {
          await movimientosService.crear({
            tipo:          'ENTRADA',
            cantidad:      total,
            descripcion:   `Ingreso inicial: ${form.nombre.trim()}`,
            materialItemId: primerItemId,
            ...(user?.id      ? { usuarioId: user.id }      : {}),
            ...(form.fichaId  ? { fichaId:   form.fichaId } : {}),
          })
        }
      } else {
        await materialesService.crearConsumible({
          stockIngreso: Number(form.cantidad),
          stockMinimo:  Number(form.stockMinimo) || 0,
          unidadMedida: form.unidadMedida,
          materialeId,
          ...(esPerecedero && form.fechaVencimiento ? { fechaVencimiento: form.fechaVencimiento } : {}),
          ...(user?.id ? { usuarioId: user.id } : {}),
        })
      }

      const tipoLabel = TIPOS.find(t => t.value === form.tipo)?.label ?? form.tipo
      toast.success(`Material "${form.nombre.trim()}" (${tipoLabel}) registrado exitosamente`)
      onGuardado?.()
    } catch (e) {
      const msg = e?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(' | ') : msg || 'Error al guardar el material.')
    } finally {
      setGuardando(false)
    }
  }

  const anioActual = new Date().getFullYear()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Registrar Producto</h2>
            <p className="text-xs text-gray-400 mt-0.5">Completa la información para agregar al inventario</p>
          </div>
          <button
            onClick={onCerrar}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>
          )}

          {/* Nombre + Descripción */}
          <InputTexto
            label="Nombre del producto *"
            placeholder="Ej: Taladro percutor"
            value={form.nombre}
            onChange={handleNombre}
          />
          <Textarea
            label="Descripción técnica"
            placeholder="Descripción detallada del producto..."
            rows={2}
            value={form.descripcion}
            onChange={set('descripcion')}
          />

          {/* UNSPSC + SKU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectorUnspsc
              value={form.codigoUnspsc}
              onChange={(item) => setForm(f => ({ ...f, codigoUnspsc: item?.codigo ?? null }))}
            />
            <div>
              <InputTexto
                label="SKU"
                placeholder="Ej: TAL-001"
                value={form.sku}
                onChange={handleSku}
              />
              {!form.skuManual && form.nombre && (
                <p className="text-[11px] text-blue-500 mt-1">
                  Auto-generado — escribe aquí para personalizar
                </p>
              )}
            </div>
          </div>

          {/* Tipo de material */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Material *</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {TIPOS.map(t => (
                <label
                  key={t.value}
                  className={`flex flex-col gap-1 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    form.tipo === t.value
                      ? 'border-[#39A900] bg-[#39A900]/8'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tipo"
                      value={t.value}
                      checked={form.tipo === t.value}
                      onChange={handleTipo}
                      className="accent-[#39A900]"
                    />
                    <span className="text-sm font-semibold text-gray-800">{t.label}</span>
                  </div>
                  <span className="text-[11px] text-gray-500 leading-snug pl-5">{t.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cantidad + Unidad + Stock mínimo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputTexto
              label="Cantidad *"
              type="number"
              min="1"
              value={form.cantidad}
              onChange={set('cantidad')}
              placeholder="Ej: 10"
            />
            {esConsumible && (
              <SelectOpcion
                label="Unidad de Medida *"
                placeholder="Selecciona..."
                options={UNIDADES}
                value={form.unidadMedida}
                onChange={set('unidadMedida')}
                name="unidadMedida"
              />
            )}
            {esConsumible && (
              <InputTexto
                label="Stock mínimo"
                type="number"
                min="0"
                value={form.stockMinimo}
                onChange={set('stockMinimo')}
                placeholder="Ej: 5"
              />
            )}
            {esDevolutivo && (
              <>
                <SelectOpcion
                  label="Estado *"
                  options={ESTADOS_ITEM}
                  value={form.estadoItem}
                  onChange={set('estadoItem')}
                  name="estadoItem"
                />
                <InputTexto
                  label="Condición"
                  value={form.condicion}
                  onChange={set('condicion')}
                  placeholder="Ej: Nuevo"
                />
              </>
            )}
          </div>

          {/* Fecha de vencimiento (solo PERECEDERO) */}
          {esPerecedero && (
            <InputFecha
              label="Fecha de vencimiento *"
              name="fechaVencimiento"
              value={form.fechaVencimiento}
              onChange={set('fechaVencimiento')}
              minAnio={anioActual}
              maxAnio={anioActual + 10}
            />
          )}

          {/* Categoría + Bodega + Ficha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectOpcion
              label="Categoría *"
              placeholder="Selecciona una categoría"
              options={categorias}
              value={form.categoriaMaterialId}
              onChange={set('categoriaMaterialId')}
              name="categoria"
            />
            <SelectOpcion
              label="Bodega / Ubicación"
              placeholder="Selecciona (opcional)"
              options={ubicaciones}
              value={form.ubicacionId}
              onChange={set('ubicacionId')}
              name="ubicacion"
            />
          </div>
          <SelectOpcion
            label="Ficha *"
            placeholder="Selecciona una ficha"
            options={fichas}
            value={form.fichaId}
            onChange={set('fichaId')}
            name="ficha"
          />

          {/* Nota informativa por tipo */}
          {esDevolutivo && (
            <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 leading-relaxed">
              Se crearán <strong>{Number(form.cantidad) || 0} ítem(s)</strong> con códigos auto-generados y se registrará un movimiento de <strong>ENTRADA</strong>.
            </p>
          )}
          {esConsumible && !esPerecedero && (
            <p className="text-xs text-purple-600 bg-purple-50 border border-purple-100 rounded-lg px-4 py-2.5 leading-relaxed">
              El movimiento de entrada inicial se registra automáticamente al guardar el consumible.
            </p>
          )}
          {esPerecedero && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5 leading-relaxed">
              Recibirás una notificación cuando este producto esté próximo a vencer (30 días o menos) o cuando ya haya vencido.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <Boton type="button" variante="secundario" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </Boton>
          <Boton type="button" variante="primario" onClick={handleGuardar} disabled={guardando || cargandoOpts}>
            {guardando ? 'Guardando...' : 'Guardar producto'}
          </Boton>
        </div>
      </div>
    </div>
  )
}
