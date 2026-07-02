import { useState, useEffect, useMemo } from 'react'
import { FiPlus, FiSearch } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { ModalFormularioSimple } from '@/components/organisms/ModalFormularioSimple/ModalFormularioSimple'
import { Badge } from '@/components/atoms/Badge/Badge'
import { Boton } from '@/components/atoms/Boton/Boton'
import { InputTexto } from '@/components/atoms/InputTexto/InputTexto'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { movimientosService } from '@/services/movimientosService'
import { usuariosService } from '@/services/usuariosService'
import { fichasService } from '@/services/fichasService'
import { materialesService } from '@/services/materialesService'
import { useToast } from '@/hooks/useToast'

const TIPOS = [
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'SALIDA_PRESTAMO', label: 'Salida por Préstamo' },
  { value: 'DEVOLUCION', label: 'Devolución' },
  { value: 'AJUSTE_POSITIVO', label: 'Ajuste Positivo' },
  { value: 'AJUSTE_NEGATIVO', label: 'Ajuste Negativo' },
  { value: 'BAJA', label: 'Baja' },
]

const TIPO_VARIANTE = {
  ENTRADA: 'success',
  SALIDA_PRESTAMO: 'warning',
  DEVOLUCION: 'info',
  AJUSTE_POSITIVO: 'success',
  AJUSTE_NEGATIVO: 'danger',
  BAJA: 'danger',
}

const TIPO_LABEL = Object.fromEntries(TIPOS.map(t => [t.value, t.label]))
const VACIO = { tipo: '', materialConsumibleId: '', cantidad: '', descripcion: '', usuarioId: '', fichaId: '' }
const POR_PAGINA = 10

export default function MovimientosPage() {
  const toast = useToast()
  const [lista, setLista] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [fichas, setFichas] = useState([])
  const [consumibles, setConsumibles] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  // Filtros
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')

  // Paginación
  const [pagina, setPagina] = useState(1)

  useEffect(() => { cargar(); cargarUsuarios(); cargarFichas(); cargarConsumibles() }, [])

  const cargar = async () => {
    try {
      const data = await movimientosService.getAll()
      setLista(Array.isArray(data) ? data : data.data ?? [])
    } catch { toast.error('Error al cargar movimientos') }
  }

  const cargarUsuarios = async () => {
    try {
      const data = await usuariosService.getAll()
      const arr = Array.isArray(data) ? data : data.data ?? []
      setUsuarios(arr.map(u => ({ value: u.id, label: u.nombre })))
    } catch {}
  }

  const cargarFichas = async () => {
    try {
      const data = await fichasService.getAll()
      const arr = Array.isArray(data) ? data : data.data ?? []
      setFichas(arr.map(f => ({ value: f.id, label: f.codigoFicha ?? f.codigo ?? f.id })))
    } catch {}
  }

  const cargarConsumibles = async () => {
    try {
      const data = await materialesService.getAllConsumibles()
      const arr = Array.isArray(data) ? data : data.data ?? []
      setConsumibles(arr.map(c => ({
        value: c.id,
        label: `${c.materiale?.nombre ?? 'Material'} (quedan ${c.stockActual} ${c.unidadMedida ?? ''})`,
      })))
    } catch {}
  }

  const guardar = async () => {
    if (!form.tipo) return setError('Selecciona un tipo de movimiento.')
    if (!form.materialConsumibleId) return setError('Selecciona el material consumible.')
    if (!form.cantidad || Number(form.cantidad) <= 0) return setError('La cantidad debe ser mayor a 0.')
    setCargando(true)
    try {
      const datos = {
        tipo: form.tipo,
        materialConsumibleId: form.materialConsumibleId,
        cantidad: Number(form.cantidad),
        descripcion: form.descripcion?.trim() || `Movimiento ${form.tipo}`,
        ...(form.usuarioId ? { usuarioId: form.usuarioId } : {}),
        ...(form.fichaId ? { fichaId: form.fichaId } : {}),
      }
      await movimientosService.crear(datos)
      toast.success('Movimiento registrado')
      setModal(false)
      setForm(VACIO)
      cargar()
    } catch (e) {
      const msg = e?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(' | ') : msg || 'Error al guardar.')
    } finally { setCargando(false) }
  }

  const formatFecha = (f) =>
    f ? new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

  const listaFiltrada = useMemo(() => {
    return lista.filter(m => {
      const textoBusqueda = filtroBusqueda.toLowerCase()
      const coincideTexto =
        !filtroBusqueda ||
        (m.descripcion ?? '').toLowerCase().includes(textoBusqueda) ||
        (m.usuario?.nombre ?? '').toLowerCase().includes(textoBusqueda) ||
        (TIPO_LABEL[m.tipo] ?? m.tipo ?? '').toLowerCase().includes(textoBusqueda)

      const coincideTipo = !filtroTipo || m.tipo === filtroTipo

      const fecha = m.creadoEn ? new Date(m.creadoEn) : null
      const coincideFechaDesde = !filtroFechaDesde || (fecha && fecha >= new Date(filtroFechaDesde))
      const coincideFechaHasta = !filtroFechaHasta || (fecha && fecha <= new Date(filtroFechaHasta + 'T23:59:59'))

      return coincideTexto && coincideTipo && coincideFechaDesde && coincideFechaHasta
    })
  }, [lista, filtroBusqueda, filtroTipo, filtroFechaDesde, filtroFechaHasta])

  const totalPaginas = Math.max(1, Math.ceil(listaFiltrada.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio = (paginaActual - 1) * POR_PAGINA
  const itemsPagina = listaFiltrada.slice(inicio, inicio + POR_PAGINA)

  const limpiarFiltros = () => {
    setFiltroBusqueda('')
    setFiltroTipo('')
    setFiltroFechaDesde('')
    setFiltroFechaHasta('')
    setPagina(1)
  }

  const hayFiltrosActivos = filtroBusqueda || filtroTipo || filtroFechaDesde || filtroFechaHasta

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 page-title">Movimientos</h1>
              <p className="text-sm text-gray-500 mt-1">Registro de entradas, salidas y ajustes de materiales.</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FiSearch size={15} />
              Filtros de búsqueda
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar por descripción o usuario..."
                  value={filtroBusqueda}
                  onChange={e => { setFiltroBusqueda(e.target.value); setPagina(1) }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <select
                value={filtroTipo}
                onChange={e => { setFiltroTipo(e.target.value); setPagina(1) }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
              >
                <option value="">Todos los tipos</option>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input
                type="date"
                value={filtroFechaDesde}
                onChange={e => { setFiltroFechaDesde(e.target.value); setPagina(1) }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                placeholder="Desde"
              />
              <input
                type="date"
                value={filtroFechaHasta}
                onChange={e => { setFiltroFechaHasta(e.target.value); setPagina(1) }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                placeholder="Hasta"
              />
            </div>
            {hayFiltrosActivos && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-500">{listaFiltrada.length} resultado{listaFiltrada.length !== 1 ? 's' : ''} encontrado{listaFiltrada.length !== 1 ? 's' : ''}</span>
                <button onClick={limpiarFiltros} className="text-xs text-[#39A900] font-medium hover:underline">Limpiar filtros</button>
              </div>
            )}
          </div>

          {/* Tabla */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#39A900]">
                  {['Tipo', 'Material', 'Cantidad', 'Descripción', 'Usuario', 'Fecha'].map(c => (
                    <th key={c} className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {itemsPagina.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                      {hayFiltrosActivos ? 'Sin resultados para los filtros aplicados' : 'Sin movimientos registrados'}
                    </td>
                  </tr>
                ) : itemsPagina.map(m => (
                  <tr key={m.id} className="hover:bg-[#39A900]/5 transition-colors">
                    <td className="px-5 py-4">
                      <Badge variante={TIPO_VARIANTE[m.tipo] ?? 'default'}>{TIPO_LABEL[m.tipo] ?? m.tipo}</Badge>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{m.materialConsumible?.materiale?.nombre ?? m.materialItem?.materiale?.nombre ?? '—'}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">{m.cantidad}</td>
                    <td className="px-5 py-4 text-gray-600 max-w-xs truncate">{m.descripcion ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-600">{m.usuario?.nombre ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{formatFecha(m.creadoEn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {listaFiltrada.length > 0
                  ? `Mostrando ${(paginaActual - 1) * POR_PAGINA + 1} a ${Math.min(paginaActual * POR_PAGINA, listaFiltrada.length)} de ${listaFiltrada.length} movimientos`
                  : 'Sin resultados'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagina(p => p - 1)}
                  disabled={paginaActual <= 1}
                  className="px-4 py-1.5 text-sm rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagina(p => p + 1)}
                  disabled={paginaActual >= totalPaginas}
                  className="px-4 py-1.5 text-sm rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>

      <ModalFormularioSimple
        titulo="Registrar Movimiento"
        visible={modal}
        onGuardar={guardar}
        onCerrar={() => setModal(false)}
        error={error}
        cargando={cargando}
      >
        <SelectOpcion label="Material consumible *" placeholder="Selecciona un material" options={consumibles} value={form.materialConsumibleId} onChange={e => setForm({ ...form, materialConsumibleId: e.target.value })} name="materialConsumibleId" />
        <SelectOpcion label="Tipo *" placeholder="Selecciona un tipo" options={TIPOS} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} name="tipo" />
        <InputTexto label="Cantidad *" type="number" min="1" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} placeholder="Ej: 10" />
        <InputTexto label="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej: Ingreso de materiales al almacén" />
        <SelectOpcion label="Ficha (para KARDEX)" placeholder="Selecciona una ficha (opcional)" options={fichas} value={form.fichaId} onChange={e => setForm({ ...form, fichaId: e.target.value })} name="fichaId" />
        <SelectOpcion label="Usuario" placeholder="Selecciona un usuario (opcional)" options={usuarios} value={form.usuarioId} onChange={e => setForm({ ...form, usuarioId: e.target.value })} name="usuarioId" />
      </ModalFormularioSimple>
    </>
  )
}
