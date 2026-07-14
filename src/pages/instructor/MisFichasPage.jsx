import { useState, useEffect } from 'react'
import {
  FiPlus, FiUsers, FiX, FiUserPlus, FiChevronLeft,
  FiPackage, FiSearch, FiAlertCircle, FiCheck, FiCalendar,
} from 'react-icons/fi'
import { DashboardLayout }  from '@/components/templates/DashboardLayout/DashboardLayout'
import { SearchBar }        from '@/components/molecules/SearchBar/SearchBar'
import { Badge }            from '@/components/atoms/Badge/Badge'
import { Boton }            from '@/components/atoms/Boton/Boton'
import { InputFecha }       from '@/components/atoms/InputFecha/InputFecha'
import { fichasService }    from '@/services/fichasService'
import { rolesService }     from '@/services/rolesService'
import { usuariosService }  from '@/services/usuariosService'
import { materialesService} from '@/services/materialesService'
import { prestamosService } from '@/services/prestamosService'
import { useToast }         from '@/hooks/useToast'
import { useAuth }          from '@/hooks/useAuth'

/* ─── helpers ────────────────────────────────────────────────────── */
const hoy = () => new Date().toISOString().slice(0, 10)
const FORM_AP_INICIAL = { nombre: '', numeroDocumento: '', correo: '', telefono: '' }
const FORM_PR_INICIAL = { motivo: '', observacion: '', fechaInicio: hoy(), fechaFin: '', fechaDevolucionEsperada: '' }

/* ─── Campo simple (aprendices) ──────────────────────────────────── */
function Campo({ label, placeholder, value, onChange, error, type = 'text', inputMode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input
        type={type} inputMode={inputMode} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-colors
          ${error ? 'border-red-300 bg-red-50 focus:border-red-400'
                  : 'border-gray-200 bg-white focus:border-[#39A900]'}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

/* ─── Indicador de pasos ─────────────────────────────────────────── */
function PasoIndicador({ pasoActual }) {
  const pasos = ['Materiales', 'Detalles']
  return (
    <div className="flex items-center gap-1">
      {pasos.map((p, i) => {
        const n = i + 1
        const activo   = n === pasoActual
        const completo = n < pasoActual
        return (
          <div key={p} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all
              ${activo   ? 'bg-[#39A900] text-white'
              : completo ? 'bg-[#39A900]/15 text-[#39A900]'
                         : 'bg-gray-100 text-gray-400'}`}
            >
              {completo
                ? <FiCheck size={11} />
                : <span className="text-[10px]">{n}</span>
              }
              {p}
            </div>
            {i < pasos.length - 1 && (
              <div className={`w-4 h-px ${completo ? 'bg-[#39A900]/40' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════ */
export default function MisFichasPage() {
  const toast = useToast()
  const { user, sedeId } = useAuth()

  /* fichas */
  const [fichas,    setFichas]    = useState([])
  const [busqueda,  setBusqueda]  = useState('')

  /* modal aprendices */
  const [apModal,    setApModal]    = useState(null)
  const [aprendices, setAprendices] = useState([])
  const [apVista,    setApVista]    = useState('lista')
  const [apForm,     setApForm]     = useState(FORM_AP_INICIAL)
  const [apErrores,  setApErrores]  = useState({})
  const [apGuardando,setApGuardando]= useState(false)
  const [aprendizRolId, setAprendizRolId] = useState(null)

  /* modal préstamo */
  const [prModal,      setPrModal]      = useState(null)   // ficha seleccionada
  const [prItems,      setPrItems]      = useState([])     // items disponibles
  const [prCargando,   setPrCargando]   = useState(false)
  const [prSeleccion,  setPrSeleccion]  = useState(new Set())
  const [prBusqueda,   setPrBusqueda]   = useState('')
  const [prPaso,       setPrPaso]       = useState(1)
  const [prForm,       setPrForm]       = useState(FORM_PR_INICIAL)
  const [prGuardando,  setPrGuardando]  = useState(false)
  const [prError,      setPrError]      = useState('')

  /* ── cargar fichas ── */
  useEffect(() => {
    fichasService.getMias()
      .then(data => {
        const lista = (Array.isArray(data) ? data : data.data ?? []).map(f => ({
          id: f.id,
          codigo: f.codigo ?? f.codigoFicha ?? '—',
          programa: f.programa?.nombre ?? f.programa ?? '—',
          estado: f.estado ?? 'activo',
        }))
        setFichas(lista)
      })
      .catch(() => toast.error('Error al cargar las fichas'))
  }, [])

  /* ── pre-carga rolId aprendiz ── */
  useEffect(() => {
    rolesService.getAll()
      .then(data => {
        const lista = Array.isArray(data) ? data : data.data ?? []
        const rol = lista.find(r => r.nombre?.toLowerCase().includes('aprendiz'))
        if (rol) setAprendizRolId(rol.id)
      })
      .catch(() => {})
  }, [])

  /* ══ APRENDICES ══════════════════════════════════════════════════ */
  const abrirAprendices = async (ficha) => {
    try {
      const data = await fichasService.getAprendices(ficha.id)
      setAprendices(Array.isArray(data) ? data : data.data ?? [])
      setApModal(ficha)
      setApVista('lista')
      setApForm(FORM_AP_INICIAL)
      setApErrores({})
    } catch { toast.error('Error al cargar aprendices') }
  }

  const cerrarAp = () => { setApModal(null); setApVista('lista'); setApForm(FORM_AP_INICIAL); setApErrores({}) }

  const validarAp = () => {
    const e = {}
    if (!apForm.nombre.trim())           e.nombre          = 'El nombre es obligatorio'
    if (!apForm.numeroDocumento.trim())  e.numeroDocumento = 'La cédula es obligatoria'
    if (!apForm.correo.trim())           e.correo          = 'El correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(apForm.correo)) e.correo = 'Correo inválido'
    if (!apForm.telefono.trim())         e.telefono        = 'El teléfono es obligatorio'
    return e
  }

  const guardarAp = async () => {
    const e = validarAp()
    if (Object.keys(e).length) { setApErrores(e); return }
    if (!aprendizRolId) { toast.error('No se encontró el rol de Aprendiz.'); return }
    setApGuardando(true)
    try {
      const contrasena = `Sena${apForm.numeroDocumento}`
      await usuariosService.crear({
        nombre: apForm.nombre.trim(),
        correo: apForm.correo.trim(),
        contrasena,
        telefono: apForm.telefono.trim(),
        numeroDocumento: apForm.numeroDocumento.trim(),
        rolId: aprendizRolId,
        fichaId: apModal.id,
        ...(sedeId ? { sedeId } : {}),
      })
      toast.success(`Aprendiz agregado. Contraseña temporal: ${contrasena}`)
      const data = await fichasService.getAprendices(apModal.id)
      setAprendices(Array.isArray(data) ? data : data.data ?? [])
      setApForm(FORM_AP_INICIAL)
      setApErrores({})
      setApVista('lista')
    } catch (err) {
      const msg = err?.response?.data?.message
      toast.error(Array.isArray(msg) ? msg[0] : msg ?? 'Error al agregar el aprendiz')
    } finally { setApGuardando(false) }
  }

  /* ══ PRÉSTAMO ════════════════════════════════════════════════════ */
  const abrirPrestamo = async (ficha) => {
    setPrModal(ficha)
    setPrPaso(1)
    setPrSeleccion(new Set())
    setPrBusqueda('')
    setPrForm(FORM_PR_INICIAL)
    setPrError('')
    setPrCargando(true)
    try {
      const data = await materialesService.getAllItems()
      const lista = (Array.isArray(data) ? data : data.data ?? [])
        .filter(i => (i.estado ?? '').toUpperCase() === 'DISPONIBLE')
      setPrItems(lista)
    } catch { toast.error('Error al cargar los materiales') }
    finally { setPrCargando(false) }
  }

  const cerrarPr = () => { setPrModal(null); setPrPaso(1); setPrSeleccion(new Set()) }

  const toggleItem = (id) =>
    setPrSeleccion(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const prItemsFiltrados = prItems.filter(i => {
    const q = prBusqueda.toLowerCase()
    return (
      (i.materiale?.nombre ?? '').toLowerCase().includes(q) ||
      (i.codigoSena ?? '').toLowerCase().includes(q) ||
      (i.materiale?.categoriaMaterial?.nombre ?? '').toLowerCase().includes(q)
    )
  })

  const validarPr = () => {
    if (!prForm.motivo.trim()) return 'El motivo es obligatorio.'
    if (!prForm.fechaFin)      return 'La fecha de devolución es obligatoria.'
    if (prForm.fechaFin < prForm.fechaInicio) return 'La fecha fin no puede ser anterior al inicio.'
    return ''
  }

  const guardarPr = async () => {
    const err = validarPr()
    if (err) { setPrError(err); return }
    setPrGuardando(true)
    setPrError('')
    try {
      const prestamo = await prestamosService.crear({
        motivo:                   prForm.motivo.trim(),
        observacion:              prForm.observacion.trim() || undefined,
        fechaInicio:              prForm.fechaInicio,
        fechaFin:                 prForm.fechaFin,
        fechaDevolucionEsperada:  prForm.fechaDevolucionEsperada || prForm.fechaFin,
        solicitanteId:            user.id,
        fichaId:                  prModal.id,
      })
      await Promise.all(
        [...prSeleccion].map(materialItemId =>
          prestamosService.agregarItem({ prestamoId: prestamo.id, materialItemId })
        )
      )
      toast.success('Préstamo creado correctamente. Queda pendiente de aprobación.')
      cerrarPr()
    } catch (err) {
      const msg = err?.response?.data?.message
      setPrError(Array.isArray(msg) ? msg[0] : msg ?? 'Error al crear el préstamo')
    } finally { setPrGuardando(false) }
  }

  /* ── filtro tabla ── */
  const filtradas = fichas.filter(f =>
    f.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.programa.toLowerCase().includes(busqueda.toLowerCase())
  )

  /* ══ RENDER ══════════════════════════════════════════════════════ */
  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 page-title">Mis Fichas</h1>
            <p className="text-sm text-gray-500 mt-1">Fichas de formación asignadas a tu cargo.</p>
          </div>

          <SearchBar placeholder="Buscar ficha o programa..." value={busqueda} onChange={setBusqueda} />

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#39A900]">
                    {['Código Ficha', 'Programa', 'Estado', 'Acciones'].map(col => (
                      <th key={col} className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtradas.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">No tienes fichas asignadas</td></tr>
                  ) : filtradas.map(f => (
                    <tr key={f.id} className="hover:bg-[#39A900]/5 transition-colors">
                      <td className="px-5 py-4 font-mono font-medium text-gray-900">{f.codigo}</td>
                      <td className="px-5 py-4 text-gray-700">{f.programa}</td>
                      <td className="px-5 py-4">
                        <Badge variante={f.estado === 'activo' ? 'success' : 'default'}>{f.estado}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => abrirAprendices(f)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                          >
                            <FiUsers size={13} /> Aprendices
                          </button>
                          <button
                            onClick={() => abrirPrestamo(f)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#39A900] hover:bg-[#2d8700] text-white rounded-lg transition-colors"
                          >
                            <FiPlus size={13} /> Préstamo
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* ══ MODAL APRENDICES ══════════════════════════════════════════ */}
      {apModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={cerrarAp} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {apVista === 'agregar' && (
                  <button onClick={() => { setApVista('lista'); setApErrores({}) }}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                    <FiChevronLeft size={18} />
                  </button>
                )}
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {apVista === 'lista' ? 'Aprendices' : 'Agregar Aprendiz'}
                  </h3>
                  <p className="text-xs text-gray-400">Ficha {apModal.codigo}</p>
                </div>
              </div>
              <button onClick={cerrarAp} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <FiX size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {apVista === 'lista' ? (
                <div className="px-6 py-4">
                  {aprendices.length === 0 ? (
                    <div className="py-10 text-center">
                      <FiUsers size={32} className="mx-auto text-gray-200 mb-3" />
                      <p className="text-sm text-gray-400">Sin aprendices registrados</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {aprendices.map((a, i) => (
                        <li key={i} className="py-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#39A900]/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-[#39A900]">{(a.nombre ?? '?')[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{a.nombre ?? '—'}</p>
                            <p className="text-xs text-gray-400">
                              {a.numeroDocumento ?? a.documento ?? ''}
                              {(a.numeroDocumento || a.documento) && a.correo ? ' · ' : ''}
                              {a.correo ?? ''}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="px-6 py-4 space-y-4">
                  <Campo label="Nombre completo" placeholder="Ej. Juan Pérez García"
                    value={apForm.nombre} onChange={v => setApForm(f => ({ ...f, nombre: v }))} error={apErrores.nombre} />
                  <Campo label="Número de cédula" placeholder="Ej. 1234567890" inputMode="numeric"
                    value={apForm.numeroDocumento} onChange={v => setApForm(f => ({ ...f, numeroDocumento: v }))} error={apErrores.numeroDocumento} />
                  <Campo label="Correo electrónico" type="email" placeholder="aprendiz@sena.edu.co"
                    value={apForm.correo} onChange={v => setApForm(f => ({ ...f, correo: v }))} error={apErrores.correo} />
                  <Campo label="Teléfono" placeholder="Ej. 3001234567" inputMode="numeric"
                    value={apForm.telefono} onChange={v => setApForm(f => ({ ...f, telefono: v }))} error={apErrores.telefono} />
                  <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                    Contraseña temporal: <span className="font-mono font-semibold text-gray-600">Sena + cédula</span>
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
              {apVista === 'lista' ? (
                <>
                  <span className="text-xs text-gray-400">{aprendices.length} aprendiz{aprendices.length !== 1 ? 'ces' : ''}</span>
                  <Boton variante="primario" className="flex items-center gap-2"
                    onClick={() => { setApVista('agregar'); setApForm(FORM_AP_INICIAL); setApErrores({}) }}>
                    <FiUserPlus size={14} /> Agregar Aprendiz
                  </Boton>
                </>
              ) : (
                <>
                  <Boton variante="secundario" onClick={() => { setApVista('lista'); setApErrores({}) }}>Cancelar</Boton>
                  <Boton variante="primario" onClick={guardarAp} disabled={apGuardando}>
                    {apGuardando ? 'Guardando…' : 'Guardar Aprendiz'}
                  </Boton>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL PRÉSTAMO ════════════════════════════════════════════ */}
      {prModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={cerrarPr} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden" style={{ maxHeight: '92vh' }}>

            {/* Cabecera */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Nuevo Préstamo</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Ficha <span className="font-mono font-semibold text-gray-600">{prModal.codigo}</span>
                    {' — '}{prModal.programa}
                  </p>
                </div>
                <button onClick={cerrarPr} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors shrink-0">
                  <FiX size={18} />
                </button>
              </div>
              <div className="mt-3">
                <PasoIndicador pasoActual={prPaso} />
              </div>
            </div>

            {/* Cuerpo */}
            <div className="flex-1 overflow-y-auto">

              {/* ── Paso 1: Materiales ── */}
              {prPaso === 1 && (
                <div className="flex flex-col h-full">
                  <div className="px-5 pt-4 pb-2">
                    <p className="text-sm text-gray-500 mb-3">Selecciona los materiales a prestar.</p>
                    <div className="relative">
                      <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar material o placa SENA..."
                        value={prBusqueda}
                        onChange={e => setPrBusqueda(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#39A900] transition-colors"
                      />
                    </div>
                  </div>

                  {prCargando ? (
                    <div className="flex-1 flex items-center justify-center py-16">
                      <div className="w-8 h-8 border-2 border-[#39A900] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : prItemsFiltrados.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                      <FiPackage size={36} className="text-gray-200 mb-3" />
                      <p className="text-sm text-gray-400 font-medium">
                        {prBusqueda ? 'Sin resultados para tu búsqueda' : 'No hay materiales disponibles'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-y-auto px-5 pb-4" style={{ maxHeight: '340px' }}>
                      <ul className="space-y-1.5 mt-1">
                        {prItemsFiltrados.map(item => {
                          const seleccionado = prSeleccion.has(item.id)
                          const nombre    = item.materiale?.nombre ?? 'Material'
                          const placa     = item.codigoSena ?? '—'
                          const categoria = item.materiale?.categoriaMaterial?.nombre ?? ''
                          const ubicacion = item.materiale?.ubicacion?.nombre ?? ''
                          const sub = [categoria, ubicacion].filter(Boolean).join(' · ')
                          return (
                            <li
                              key={item.id}
                              onClick={() => toggleItem(item.id)}
                              className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer border transition-all
                                ${seleccionado
                                  ? 'border-[#39A900] bg-[#39A900]/5'
                                  : 'border-transparent hover:border-gray-200 hover:bg-gray-50'}`}
                            >
                              {/* Checkbox visual */}
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                                ${seleccionado ? 'bg-[#39A900] border-[#39A900]' : 'border-gray-300'}`}>
                                {seleccionado && <FiCheck size={11} className="text-white" strokeWidth={3} />}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{nombre}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-mono text-gray-500">{placa}</span>
                                  {sub && <span className="text-xs text-gray-400">· {sub}</span>}
                                </div>
                              </div>

                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">
                                DISPONIBLE
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* ── Paso 2: Detalles ── */}
              {prPaso === 2 && (
                <div className="px-6 py-5 space-y-4">

                  {/* Resumen de materiales seleccionados */}
                  <div className="bg-[#39A900]/5 border border-[#39A900]/20 rounded-xl px-4 py-3">
                    <p className="text-xs font-bold text-[#39A900] uppercase tracking-wide mb-2">
                      Materiales seleccionados ({prSeleccion.size})
                    </p>
                    <ul className="space-y-1">
                      {[...prSeleccion].map(id => {
                        const item = prItems.find(i => i.id === id)
                        return (
                          <li key={id} className="flex items-center gap-2">
                            <FiCheck size={11} className="text-[#39A900] shrink-0" />
                            <span className="text-xs text-gray-700">
                              {item?.materiale?.nombre ?? '—'}{' '}
                              <span className="font-mono text-gray-400">{item?.codigoSena ?? ''}</span>
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                  {/* Motivo */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Motivo <span className="text-red-400">*</span></label>
                    <textarea
                      rows={2}
                      placeholder="Ej: Práctica de laboratorio — diseño de circuitos"
                      value={prForm.motivo}
                      onChange={e => setPrForm(f => ({ ...f, motivo: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#39A900] resize-none transition-colors"
                    />
                  </div>

                  {/* Observación */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Observación <span className="text-gray-400 font-normal">(opcional)</span></label>
                    <textarea
                      rows={2}
                      placeholder="Detalles adicionales..."
                      value={prForm.observacion}
                      onChange={e => setPrForm(f => ({ ...f, observacion: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#39A900] resize-none transition-colors"
                    />
                  </div>

                  {/* Fechas */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                      <FiCalendar size={12} /> Fechas
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <InputFecha
                        label="Inicio *"
                        name="fechaInicio"
                        value={prForm.fechaInicio}
                        onChange={e => setPrForm(f => ({ ...f, fechaInicio: e.target.value }))}
                      />
                      <InputFecha
                        label="Fin *"
                        name="fechaFin"
                        value={prForm.fechaFin}
                        onChange={e => setPrForm(f => ({ ...f, fechaFin: e.target.value }))}
                      />
                      <InputFecha
                        label="Dev. esperada"
                        name="fechaDevolucionEsperada"
                        value={prForm.fechaDevolucionEsperada}
                        onChange={e => setPrForm(f => ({ ...f, fechaDevolucionEsperada: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Error */}
                  {prError && (
                    <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      <FiAlertCircle size={16} className="shrink-0 mt-0.5" />
                      {prError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pie */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
              {prPaso === 1 ? (
                <>
                  <Boton variante="secundario" onClick={cerrarPr}>Cancelar</Boton>
                  <div className="flex items-center gap-3">
                    {prSeleccion.size > 0 && (
                      <span className="text-xs text-[#39A900] font-semibold">
                        {prSeleccion.size} seleccionado{prSeleccion.size !== 1 ? 's' : ''}
                      </span>
                    )}
                    <Boton
                      variante="primario"
                      disabled={prSeleccion.size === 0 || prCargando}
                      onClick={() => { setPrPaso(2); setPrError('') }}
                    >
                      Siguiente →
                    </Boton>
                  </div>
                </>
              ) : (
                <>
                  <Boton variante="secundario" onClick={() => { setPrPaso(1); setPrError('') }}>
                    ← Atrás
                  </Boton>
                  <Boton variante="primario" onClick={guardarPr} disabled={prGuardando}>
                    {prGuardando ? 'Creando…' : 'Crear Préstamo'}
                  </Boton>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
