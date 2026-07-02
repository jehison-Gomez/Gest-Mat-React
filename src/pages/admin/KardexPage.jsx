import { useState, useEffect, useMemo } from 'react'
import { FiPlus } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { ModalFormularioSimple } from '@/components/organisms/ModalFormularioSimple/ModalFormularioSimple'
import { Boton } from '@/components/atoms/Boton/Boton'
import { InputTexto } from '@/components/atoms/InputTexto/InputTexto'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { kardexService } from '@/services/kardexService'
import { movimientosService } from '@/services/movimientosService'
import { fichasService } from '@/services/fichasService'
import { usuariosService } from '@/services/usuariosService'
import { useToast } from '@/hooks/useToast'

const VACIO = { movimientoId: '', fichaId: '', usuarioId: '', cantidad: '', saldoAnterior: '', saldoActual: '' }
const POR_PAGINA = 10

const TIPO_LABEL = {
  ENTRADA: 'Entrada',
  SALIDA_PRESTAMO: 'Salida Préstamo',
  DEVOLUCION: 'Devolución',
  AJUSTE_POSITIVO: 'Ajuste +',
  AJUSTE_NEGATIVO: 'Ajuste -',
  BAJA: 'Baja',
}

export default function KardexPage() {
  const toast = useToast()
  const [lista, setLista] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [fichas, setFichas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [pagina, setPagina] = useState(1)

  useEffect(() => { cargarTodo() }, [])

  const cargarTodo = async () => {
    try {
      const [kardexData, movData, ficData, usrData] = await Promise.all([
        kardexService.getAll(),
        movimientosService.getAll(),
        fichasService.getAll(),
        usuariosService.getAll(),
      ])
      const arrMov = Array.isArray(movData) ? movData : movData.data ?? []
      const arrFic = Array.isArray(ficData) ? ficData : ficData.data ?? []
      const arrUsr = Array.isArray(usrData) ? usrData : usrData.data ?? []

      setMovimientos(arrMov.map(m => ({ value: m.id, label: `${TIPO_LABEL[m.tipo] ?? m.tipo} — cant. ${m.cantidad}` })))
      setFichas(arrFic.map(f => ({ value: f.id, label: f.codigoFicha })))
      setUsuarios(arrUsr.map(u => ({ value: u.id, label: u.nombre })))

      const movPorId = new Map(arrMov.map(m => [m.id, m]))
      const ficPorId = new Map(arrFic.map(f => [f.id, f]))
      const usrPorId = new Map(arrUsr.map(u => [u.id, u]))

      const arrKardex = Array.isArray(kardexData) ? kardexData : kardexData.data ?? []
      const unidos = arrKardex.map(k => ({
        ...k,
        movimiento: movPorId.get(k.movimientoId) ?? null,
        ficha: ficPorId.get(k.fichaId) ?? null,
        usuario: usrPorId.get(k.usuarioId) ?? null,
      }))
      setLista(unidos)
    } catch { toast.error('Error al cargar el kardex') }
  }

  const cargar = cargarTodo

  const abrir = () => { setForm(VACIO); setError(''); setModal(true) }

  const guardar = async () => {
    if (!form.movimientoId) return setError('Selecciona un movimiento.')
    if (!form.fichaId) return setError('Selecciona una ficha.')
    if (!form.usuarioId) return setError('Selecciona un usuario.')
    if (!form.cantidad || Number(form.cantidad) <= 0) return setError('La cantidad debe ser mayor a 0.')
    if (form.saldoAnterior === '') return setError('El saldo anterior es obligatorio.')
    if (form.saldoActual === '') return setError('El saldo actual es obligatorio.')
    setCargando(true)
    try {
      await kardexService.crear({
        movimientoId: form.movimientoId,
        fichaId: form.fichaId,
        usuarioId: form.usuarioId,
        cantidad: Number(form.cantidad),
        saldoAnterior: Number(form.saldoAnterior),
        saldoActual: Number(form.saldoActual),
      })
      toast.success('Registro de kardex creado')
      setModal(false)
      cargar()
    } catch (e) {
      const msg = e?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(' | ') : msg || 'Error al guardar.')
    } finally { setCargando(false) }
  }

  const listaFiltrada = lista
  const totalPaginas = Math.max(1, Math.ceil(listaFiltrada.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio = (paginaActual - 1) * POR_PAGINA
  const itemsPagina = useMemo(() => listaFiltrada.slice(inicio, inicio + POR_PAGINA), [listaFiltrada, inicio])

  const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 page-title">Kardex</h1>
              <p className="text-sm text-gray-500 mt-1">Registro de auditoría de movimientos de materiales. Solo lectura y creación.</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#39A900]">
                  {['Movimiento', 'Ficha', 'Usuario', 'Cantidad', 'Saldo Anterior', 'Saldo Actual', 'Fecha'].map(c => (
                    <th key={c} className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {itemsPagina.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">Sin registros en el kardex</td></tr>
                ) : itemsPagina.map(k => (
                  <tr key={k.id} className="hover:bg-[#39A900]/5 transition-colors">
                    <td className="px-5 py-4 text-gray-600">{TIPO_LABEL[k.movimiento?.tipo] ?? k.movimiento?.tipo ?? '—'}</td>
                    <td className="px-5 py-4 font-mono text-sm text-gray-600">{k.ficha?.codigoFicha ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-600">{k.usuario?.nombre ?? '—'}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">{k.cantidad}</td>
                    <td className="px-5 py-4 text-gray-500">{k.saldoAnterior}</td>
                    <td className="px-5 py-4 text-gray-900 font-medium">{k.saldoActual}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{formatFecha(k.creadoEn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Paginación */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {listaFiltrada.length > 0
                  ? `Mostrando ${inicio + 1} a ${Math.min(paginaActual * POR_PAGINA, listaFiltrada.length)} de ${listaFiltrada.length} registros`
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
        titulo="Nuevo Registro de Kardex"
        visible={modal}
        onGuardar={guardar}
        onCerrar={() => setModal(false)}
        error={error}
        cargando={cargando}
      >
        <SelectOpcion label="Movimiento *" placeholder="Selecciona un movimiento" options={movimientos} value={form.movimientoId} onChange={e => setForm({ ...form, movimientoId: e.target.value })} name="movimientoId" />
        <SelectOpcion label="Ficha *" placeholder="Selecciona una ficha" options={fichas} value={form.fichaId} onChange={e => setForm({ ...form, fichaId: e.target.value })} name="fichaId" />
        <SelectOpcion label="Usuario *" placeholder="Selecciona un usuario" options={usuarios} value={form.usuarioId} onChange={e => setForm({ ...form, usuarioId: e.target.value })} name="usuarioId" />
        <InputTexto label="Cantidad *" type="number" min="1" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} placeholder="Ej: 5" />
        <InputTexto label="Saldo Anterior *" type="number" min="0" value={form.saldoAnterior} onChange={e => setForm({ ...form, saldoAnterior: e.target.value })} placeholder="Ej: 20" />
        <InputTexto label="Saldo Actual *" type="number" min="0" value={form.saldoActual} onChange={e => setForm({ ...form, saldoActual: e.target.value })} placeholder="Ej: 25" />
      </ModalFormularioSimple>
    </>
  )
}
