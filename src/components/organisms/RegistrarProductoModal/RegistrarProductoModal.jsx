import { useState, useEffect, useMemo } from 'react'
import { FiX, FiSearch, FiPlus, FiPackage } from 'react-icons/fi'
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
import { AsignarCodigosModal } from '@/components/organisms/AsignarCodigosModal/AsignarCodigosModal'

/* ── constantes ─────────────────────────────────────────────────────── */
const TIPOS = [
  { value: 'item',       label: 'DEVOLUTIVO', desc: 'Se devuelve tras el uso (equipos, herramientas)' },
  { value: 'consumible', label: 'CONSUMO',    desc: 'Se consume con el uso (insumos, papelería)' },
  { value: 'perecedero', label: 'PERECEDERO', desc: 'Consumible con fecha de vencimiento (alimentos, químicos)' },
]

const TIPO_POR_CATEGORIA = {
  gastronomia:  'perecedero',
  limpieza:     'consumible',
  oficina:      'consumible',
  tecnologia:   'item',
  audiovisual:  'item',
  red:          'item',
  herramientas: 'item',
  mobiliario:   'item',
  epp:          'consumible',
  electrico:    'item',
}

const UNIDADES = [
  { value: 'unidad', label: 'Unidad'  }, { value: 'caja',  label: 'Caja'   },
  { value: 'bolsa',  label: 'Bolsa'   }, { value: 'rollo', label: 'Rollo'  },
  { value: 'paca',   label: 'Paca'    }, { value: 'litro', label: 'Litro'  },
  { value: 'galon',  label: 'Galón'   }, { value: 'kg',    label: 'Kilogramo (kg)' },
  { value: 'gramo',  label: 'Gramo'   }, { value: 'metro', label: 'Metro'  },
  { value: 'par',    label: 'Par'     }, { value: 'resma', label: 'Resma'  },
]

const ESTADOS_ITEM = [
  { value: 'BUENO',   label: 'Bueno'   },
  { value: 'REGULAR', label: 'Regular' },
  { value: 'MALO',    label: 'Malo'    },
  { value: 'DAÑADO',  label: 'Dañado'  },
]

const FORM_VACIO = {
  nombre: '', descripcion: '', codigoUnspsc: null,
  tipo: 'item', unidadMedida: 'unidad', cantidad: '1', stockMinimo: '1',
  categoriaMaterialId: '', fichaId: '', ubicacionId: '',
  fechaVencimiento: '', condicion: 'Nuevo', estadoItem: 'BUENO',
}

const generarPlacaBase = (nombre) =>
  nombre.trim().toUpperCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '')
    .substring(0, 14)

/* ═══════════════════════════════════════════════════════════════════════
   Componente principal
═══════════════════════════════════════════════════════════════════════ */
export const RegistrarProductoModal = ({ onCerrar, onGuardado }) => {
  const { user } = useAuth()
  const toast    = useToast()

  // Modo: 'nuevo' | 'agregar'
  const [modo, setModo] = useState('nuevo')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Header con selector de modo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Registrar Material</h2>
            <p className="text-xs text-gray-400 mt-0.5">Crea un nuevo material o agrega una unidad a uno existente</p>
          </div>
          <button onClick={onCerrar} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <FiX size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 pb-0 shrink-0">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setModo('nuevo')}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                modo === 'nuevo'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiPlus size={14} /> Nuevo Material
            </button>
            <button
              type="button"
              onClick={() => setModo('agregar')}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                modo === 'agregar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiPackage size={14} /> Agregar Unidad a Existente
            </button>
          </div>
        </div>

        {/* Contenido según modo */}
        {modo === 'nuevo' ? (
          <FormNuevoMaterial
            user={user}
            toast={toast}
            onCerrar={onCerrar}
            onGuardado={onGuardado}
          />
        ) : (
          <FormAgregarUnidad
            user={user}
            toast={toast}
            onCerrar={onCerrar}
            onGuardado={onGuardado}
          />
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   Formulario: Nuevo Material (primera vez)
═══════════════════════════════════════════════════════════════════════ */
function FormNuevoMaterial({ user, toast, onCerrar, onGuardado }) {
  const [categorias,   setCategorias]   = useState([])
  const [fichas,       setFichas]       = useState([])
  const [ubicaciones,  setUbicaciones]  = useState([])
  const [cargandoOpts, setCargandoOpts] = useState(true)
  const [form,         setForm]         = useState(FORM_VACIO)
  const [error,        setError]        = useState('')
  const [guardando,    setGuardando]    = useState(false)
  const [itemsCreados,     setItemsCreados]     = useState(null)
  const [mostrarAsignacion, setMostrarAsignacion] = useState(false)

  const esPerecedero = form.tipo === 'perecedero'
  const esDevolutivo = form.tipo === 'item'
  const esConsumible = !esDevolutivo

  useEffect(() => {
    Promise.all([categoriasService.getAll(), fichasService.getAll(), ubicacionesService.getAll()])
      .then(([cat, fic, ubi]) => {
        setCategorias((Array.isArray(cat) ? cat : cat.data ?? []).map(c => ({ value: c.id, label: c.nombre })))
        setFichas((Array.isArray(fic) ? fic : fic.data ?? []).map(f => ({
          value: f.id,
          label: f.programa?.nombre ? `${f.codigoFicha} — ${f.programa.nombre}` : f.codigoFicha,
        })))
        setUbicaciones((Array.isArray(ubi) ? ubi : ubi.data ?? []).map(u => ({ value: u.id, label: u.nombre })))
      })
      .catch(() => toast.error('Error al cargar opciones'))
      .finally(() => setCargandoOpts(false))
  }, [])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleTipo = (e) => {
    const t = e.target.value
    setForm(f => ({ ...f, tipo: t, fechaVencimiento: t !== 'perecedero' ? '' : f.fechaVencimiento }))
  }

  const handleUnspsc = (item) => {
    if (item) {
      const t = TIPO_POR_CATEGORIA[item.categoria] ?? 'item'
      setForm(f => ({ ...f, codigoUnspsc: item.codigo, tipo: t, fechaVencimiento: t !== 'perecedero' ? '' : f.fechaVencimiento }))
    } else {
      setForm(f => ({ ...f, codigoUnspsc: null }))
    }
  }

  const validar = () => {
    if (!form.nombre.trim())       return 'El nombre es obligatorio.'
    if (!form.categoriaMaterialId) return 'Selecciona una categoría.'
    if (!form.cantidad || Number(form.cantidad) < 1) return 'La cantidad debe ser al menos 1.'
    if (esConsumible && !form.unidadMedida) return 'Selecciona una unidad de medida.'
    if (esPerecedero) {
      if (!form.fechaVencimiento) return 'La fecha de vencimiento es obligatoria.'
      if (new Date(form.fechaVencimiento) <= new Date()) return 'La fecha debe ser futura.'
    }
    return ''
  }

  const handleGuardar = async () => {
    const err = validar()
    if (err) return setError(err)
    setError('')
    setGuardando(true)
    try {
      const material = await materialesService.crear({
        nombre:              form.nombre.trim(),
        descripcion:         form.descripcion.trim() || form.nombre.trim(),
        tipo:                esDevolutivo ? 'item' : 'consumible',
        categoriaMaterialId: form.categoriaMaterialId,
        ...(form.fichaId ? { fichaId: form.fichaId } : {}),
        ...(form.codigoUnspsc ? { codigoUnspsc: form.codigoUnspsc } : {}),
        ...(form.ubicacionId  ? { ubicacionId:  form.ubicacionId  } : {}),
      })
      const materialeId = material?.id ?? material?.data?.id

      if (esDevolutivo) {
        const total   = Number(form.cantidad)
        const base    = generarPlacaBase(form.nombre).substring(0, 11)
        const codigos = Array.from({ length: total }, (_, i) =>
          `${base}-${String(i + 1).padStart(3, '0')}`
        )
        const resultados = await Promise.all(
          codigos.map(codigo =>
            materialesService.crearItem({ codigoSena: codigo, condicion: form.condicion || 'Nuevo', estadoItem: form.estadoItem || 'BUENO', materialeId })
          )
        )
        const primerItemId = resultados[0]?.id ?? resultados[0]?.data?.id
        if (primerItemId) {
          await movimientosService.crear({
            tipo: 'ENTRADA', cantidad: total,
            descripcion: `Ingreso inicial: ${form.nombre.trim()}`,
            materialItemId: primerItemId,
            ...(user?.id ? { usuarioId: user.id } : {}),
          })
        }
        if (total > 1) {
          setItemsCreados(resultados.map((r, i) => ({ id: r?.id ?? r?.data?.id, codigoSena: codigos[i] })))
          setMostrarAsignacion(true)
          setGuardando(false)
          return
        }
      } else {
        await materialesService.crearConsumible({
          stockIngreso: Number(form.cantidad), stockMinimo: Number(form.stockMinimo) || 0,
          unidadMedida: form.unidadMedida, materialeId,
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

  if (mostrarAsignacion && itemsCreados) {
    return (
      <AsignarCodigosModal
        items={itemsCreados}
        nombreMaterial={form.nombre}
        onCerrar={() => { setMostrarAsignacion(false); onGuardado?.() }}
        onGuardado={() => { setMostrarAsignacion(false); onGuardado?.() }}
      />
    )
  }

  return (
    <>
      <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>}

        <InputTexto label="Nombre del material *" placeholder="Ej: Computador Portátil HP" value={form.nombre} onChange={set('nombre')} />
        <Textarea label="Descripción técnica" placeholder="Descripción detallada..." rows={2} value={form.descripcion} onChange={set('descripcion')} />

        <div className="max-w-lg">
          <SelectorUnspsc value={form.codigoUnspsc} onChange={handleUnspsc} />
        </div>

        {esDevolutivo && form.nombre.trim() && (
          <div className="bg-[#39A900]/5 border border-[#39A900]/20 rounded-lg px-4 py-3">
            <p className="text-xs font-medium text-[#39A900] mb-1">Placa(s) SENA que se asignarán</p>
            <p className="text-sm font-mono text-gray-800">
              {generarPlacaBase(form.nombre)}-001
              {Number(form.cantidad) > 1 && (
                <span className="text-gray-400 ml-2">… {generarPlacaBase(form.nombre)}-{String(Number(form.cantidad)).padStart(3, '0')}</span>
              )}
            </p>
            {Number(form.cantidad) > 1 && (
              <p className="text-[11px] text-gray-500 mt-1">Podrás personalizar cada placa en el paso siguiente.</p>
            )}
          </div>
        )}

        {/* Tipo */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">Tipo de Material *</label>
            {form.codigoUnspsc && (
              <span className="text-[10px] bg-green-100 text-[#39A900] px-2 py-0.5 rounded-full font-semibold">Auto-detectado por UNSPSC</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TIPOS.map(t => (
              <label key={t.value} className={`flex flex-col gap-1 p-3 border-2 rounded-xl cursor-pointer transition-all ${form.tipo === t.value ? 'border-[#39A900] bg-[#39A900]/8' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center gap-2">
                  <input type="radio" name="tipo" value={t.value} checked={form.tipo === t.value} onChange={handleTipo} className="accent-[#39A900]" />
                  <span className="text-sm font-semibold text-gray-800">{t.label}</span>
                </div>
                <span className="text-[11px] text-gray-500 leading-snug pl-5">{t.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cantidad + extras */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputTexto label="Cantidad *" type="number" min="1" value={form.cantidad} onChange={set('cantidad')} placeholder="Ej: 1" />
          {esConsumible && <SelectOpcion label="Unidad de Medida *" placeholder="Selecciona..." options={UNIDADES} value={form.unidadMedida} onChange={set('unidadMedida')} name="unidadMedida" />}
          {esConsumible && <InputTexto label="Stock mínimo" type="number" min="0" value={form.stockMinimo} onChange={set('stockMinimo')} placeholder="Ej: 5" />}
          {esDevolutivo && (
            <>
              <SelectOpcion label="Estado *" options={ESTADOS_ITEM} value={form.estadoItem} onChange={set('estadoItem')} name="estadoItem" />
              <InputTexto label="Condición" value={form.condicion} onChange={set('condicion')} placeholder="Ej: Nuevo" />
            </>
          )}
        </div>

        {esPerecedero && (
          <InputFecha label="Fecha de vencimiento *" name="fechaVencimiento" value={form.fechaVencimiento} onChange={set('fechaVencimiento')} minAnio={anioActual} maxAnio={anioActual + 10} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectOpcion label="Categoría *" placeholder="Selecciona una categoría" options={categorias} value={form.categoriaMaterialId} onChange={set('categoriaMaterialId')} name="categoria" />
          <SelectOpcion label="Bodega / Ubicación" placeholder="Selecciona (opcional)" options={ubicaciones} value={form.ubicacionId} onChange={set('ubicacionId')} name="ubicacion" />
        </div>
        <SelectOpcion label="Ficha (opcional)" placeholder="Selecciona una ficha" options={fichas} value={form.fichaId} onChange={set('fichaId')} name="ficha" />

        {esDevolutivo && (
          <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 leading-relaxed">
            Se crearán <strong>{Number(form.cantidad) || 0} ítem(s)</strong> con Placas SENA auto-generadas y un movimiento de <strong>ENTRADA</strong>.
            {Number(form.cantidad) > 1 && ' Podrás editar cada placa en el paso siguiente.'}
          </p>
        )}
        {esConsumible && !esPerecedero && (
          <p className="text-xs text-purple-600 bg-purple-50 border border-purple-100 rounded-lg px-4 py-2.5">El movimiento de entrada se registra automáticamente al guardar.</p>
        )}
        {esPerecedero && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5">Recibirás una notificación cuando esté próximo a vencer.</p>
        )}
      </div>

      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
        <Boton type="button" variante="secundario" onClick={onCerrar} disabled={guardando}>Cancelar</Boton>
        <Boton type="button" variante="primario" onClick={handleGuardar} disabled={guardando || cargandoOpts}>
          {guardando ? 'Guardando...' : 'Guardar material'}
        </Boton>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   Formulario: Agregar Unidad a Material Existente
═══════════════════════════════════════════════════════════════════════ */
function FormAgregarUnidad({ user, toast, onCerrar, onGuardado }) {
  const [materialesDevolutivos, setMaterialesDevolutivos] = useState([])
  const [todosItems,            setTodosItems]            = useState([])
  const [cargando,              setCargando]              = useState(true)
  const [busqueda,              setBusqueda]              = useState('')
  const [materialSel,           setMaterialSel]           = useState(null)
  const [nuevaPlaca,            setNuevaPlaca]            = useState('')
  const [estadoItem,            setEstadoItem]            = useState('BUENO')
  const [condicion,             setCondicion]             = useState('Nuevo')
  const [error,                 setError]                 = useState('')
  const [guardando,             setGuardando]             = useState(false)

  useEffect(() => {
    Promise.all([materialesService.getAll(), materialesService.getAllItems()])
      .then(([mats, items]) => {
        const arrMats  = Array.isArray(mats)  ? mats  : mats.data  ?? []
        const arrItems = Array.isArray(items) ? items : items.data ?? []
        setMaterialesDevolutivos(arrMats.filter(m => m.tipo === 'item'))
        setTodosItems(arrItems)
      })
      .catch(() => toast.error('Error al cargar materiales'))
      .finally(() => setCargando(false))
  }, [])

  // Filtrar por búsqueda
  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return materialesDevolutivos
    const q = busqueda.toLowerCase()
    return materialesDevolutivos.filter(m =>
      m.nombre.toLowerCase().includes(q) ||
      m.categoriaMaterial?.nombre?.toLowerCase().includes(q)
    )
  }, [busqueda, materialesDevolutivos])

  // Contar unidades del material seleccionado
  const unidadesActuales = useMemo(() => {
    if (!materialSel) return 0
    return todosItems.filter(i => (i.materiale?.id ?? i.materialeId) === materialSel.id).length
  }, [materialSel, todosItems])

  const seleccionar = (mat) => {
    setMaterialSel(mat)
    setBusqueda('')
    const count = todosItems.filter(i => (i.materiale?.id ?? i.materialeId) === mat.id).length
    const base  = generarPlacaBase(mat.nombre).substring(0, 11)
    setNuevaPlaca(`${base}-${String(count + 1).padStart(3, '0')}`)
    setError('')
  }

  const limpiarSeleccion = () => {
    setMaterialSel(null)
    setBusqueda('')
    setNuevaPlaca('')
    setError('')
  }

  const handleGuardar = async () => {
    if (!materialSel) return setError('Selecciona un material de la lista.')
    if (!nuevaPlaca.trim()) return setError('La Placa SENA es obligatoria.')
    setError('')
    setGuardando(true)
    try {
      const item = await materialesService.crearItem({
        codigoSena:  nuevaPlaca.trim().toUpperCase(),
        condicion:   condicion || 'Nuevo',
        estadoItem:  estadoItem || 'BUENO',
        materialeId: materialSel.id,
      })
      const itemId = item?.id ?? item?.data?.id
      if (itemId) {
        await movimientosService.crear({
          tipo:           'ENTRADA',
          cantidad:       1,
          descripcion:    `Ingreso de unidad adicional: ${materialSel.nombre}`,
          materialItemId: itemId,
          ...(user?.id ? { usuarioId: user.id } : {}),
        })
      }
      toast.success(`Nueva unidad "${nuevaPlaca.trim().toUpperCase()}" agregada a "${materialSel.nombre}"`)
      onGuardado?.()
    } catch (e) {
      const msg = e?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(' | ') : msg || 'Error al agregar la unidad.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden">

        {error && (
          <p className="mx-6 mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 shrink-0">
            {error}
          </p>
        )}

        {!materialSel ? (
          /* ── PASO 1: seleccionar material ── */
          <div className="flex flex-col flex-1 overflow-hidden px-6 pt-4 pb-0">
            <p className="text-xs font-medium text-gray-500 mb-2">Paso 1 — Elige el material al que quieres agregar una unidad</p>

            {/* Buscador */}
            <div className="relative mb-3 shrink-0">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder={cargando ? 'Cargando materiales…' : 'Filtrar por nombre…'}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900] focus:border-[#39A900] bg-gray-50"
                disabled={cargando}
              />
            </div>

            {/* Lista fija, scrollable */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 mb-4">
              {cargando ? (
                <p className="text-center text-sm text-gray-400 py-10">Cargando materiales…</p>
              ) : filtrados.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-10">
                  {busqueda.trim() ? 'Sin resultados para esa búsqueda.' : 'No hay materiales devolutivos registrados.'}
                </p>
              ) : (
                filtrados.map(m => {
                  const count = todosItems.filter(i => (i.materiale?.id ?? i.materialeId) === m.id).length
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => seleccionar(m)}
                      className="w-full text-left px-4 py-3 hover:bg-[#39A900]/5 transition-colors flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.nombre}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{m.categoriaMaterial?.nombre ?? '—'}</p>
                      </div>
                      <span className="text-xs font-semibold text-[#39A900] bg-[#39A900]/10 px-2 py-0.5 rounded-full shrink-0">
                        {count} ud.
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>

        ) : (
          /* ── PASO 2: datos de la nueva unidad ── */
          <div className="px-6 pt-4 pb-0 overflow-y-auto flex-1 space-y-4">
            <p className="text-xs font-medium text-gray-500">Paso 2 — Datos de la nueva unidad</p>

            {/* Material seleccionado */}
            <div className="border-2 border-[#39A900] bg-[#39A900]/5 rounded-xl p-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{materialSel.nombre}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {materialSel.categoriaMaterial?.nombre ?? '—'} ·{' '}
                  <span className="text-[#39A900] font-medium">{unidadesActuales} unidad{unidadesActuales !== 1 ? 'es' : ''} registrada{unidadesActuales !== 1 ? 's' : ''}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={limpiarSeleccion}
                className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-2 py-1 rounded-lg transition-colors shrink-0"
              >
                Cambiar
              </button>
            </div>

            {/* Placa SENA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Placa SENA *</label>
              <input
                type="text"
                value={nuevaPlaca}
                onChange={e => setNuevaPlaca(e.target.value.toUpperCase())}
                placeholder={`Ej: ${generarPlacaBase(materialSel.nombre).substring(0,11)}-${String(unidadesActuales + 1).padStart(3,'0')}`}
                className="w-full px-3 py-2.5 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39A900] focus:border-[#39A900] uppercase"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Número sugerido: <strong>{unidadesActuales + 1}</strong>. Puedes editarlo libremente.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectOpcion label="Estado" options={ESTADOS_ITEM} value={estadoItem} onChange={e => setEstadoItem(e.target.value)} name="estadoItem" />
              <InputTexto label="Condición" value={condicion} onChange={e => setCondicion(e.target.value)} placeholder="Ej: Nuevo" />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <p className="text-xs text-blue-700">
                Se registrará la unidad <strong className="font-mono">{nuevaPlaca || '—'}</strong> y un movimiento de <strong>ENTRADA</strong>.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
        <Boton type="button" variante="secundario" onClick={onCerrar} disabled={guardando}>Cancelar</Boton>
        <Boton type="button" variante="primario" onClick={handleGuardar} disabled={guardando || !materialSel}>
          {guardando ? 'Guardando...' : 'Agregar unidad'}
        </Boton>
      </div>
    </>
  )
}
