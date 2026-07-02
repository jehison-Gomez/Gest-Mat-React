import { useState, useEffect } from 'react'
import { FiPlus } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { ModalFormularioSimple } from '@/components/organisms/ModalFormularioSimple/ModalFormularioSimple'
import { ModalConfirmacion } from '@/components/molecules/ModalConfirmacion/ModalConfirmacion'
import { Badge } from '@/components/atoms/Badge/Badge'
import { Boton } from '@/components/atoms/Boton/Boton'
import { InputTexto } from '@/components/atoms/InputTexto/InputTexto'
import { InputFecha } from '@/components/atoms/InputFecha/InputFecha'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { AccionesFila } from '@/components/molecules/AccionesFila/AccionesFila'
import { fichasService } from '@/services/fichasService'
import { programasService } from '@/services/programasService'
import { usuariosService } from '@/services/usuariosService'
import { useToast } from '@/hooks/useToast'

const VACIO = { codigoFicha: '', fechaInicio: '', fechaFin: '', programaId: '', usuarioLiderId: '', estado: 'activo' }

const ESTADOS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
]

export default function FichasPage() {
  const toast = useToast()
  const [lista, setLista] = useState([])
  const [programas, setProgramas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [eliminar, setEliminar] = useState(null)

  useEffect(() => { cargar(); cargarOpciones() }, [])

  const cargar = async () => {
    try {
      const data = await fichasService.getAll()
      setLista(Array.isArray(data) ? data : data.data ?? [])
    } catch { toast.error('Error al cargar fichas') }
  }

  const cargarOpciones = async () => {
    try {
      const [progData, usersData] = await Promise.all([
        programasService.getAll(),
        usuariosService.getAll(),
      ])
      const arrProg = Array.isArray(progData) ? progData : progData.data ?? []
      const arrUsers = Array.isArray(usersData) ? usersData : usersData.data ?? []
      const ROLES_LIDER = ['instructor', 'instructor_encargado']
      const instructores = arrUsers.filter(u => {
        const rol = u.role?.nombre?.toLowerCase() ?? u.rol?.toLowerCase() ?? ''
        return ROLES_LIDER.some(r => rol.includes(r))
      })
      setProgramas(arrProg.map(p => ({ value: p.id, label: `${p.codigo} - ${p.nombre}` })))
      setUsuarios(instructores.map(u => ({ value: u.id, label: u.nombre })))
    } catch { toast.error('Error al cargar opciones') }
  }

  const abrir = (item = null) => {
    setEditando(item)
    setForm(item ? {
      codigoFicha: item.codigoFicha ?? '',
      fechaInicio: item.fechaInicio?.slice(0, 10) ?? '',
      fechaFin: item.fechaFin?.slice(0, 10) ?? '',
      programaId: item.programa?.id ?? item.programaId ?? '',
      usuarioLiderId: item.usuarioLider?.id ?? item.usuarioLiderId ?? '',
      estado: item.estado ?? 'activo',
    } : VACIO)
    setError('')
    setModal(true)
  }

  const guardar = async () => {
    if (!form.codigoFicha) return setError('El código de ficha es obligatorio.')
    if (!form.fechaInicio) return setError('La fecha de inicio es obligatoria.')
    if (!form.fechaFin) return setError('La fecha de fin es obligatoria.')
    if (!form.programaId) return setError('Selecciona un programa.')
    setCargando(true)
    try {
      const datos = {
        codigoFicha: form.codigoFicha.trim(),
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        programaId: form.programaId,
        estado: form.estado,
        ...(form.usuarioLiderId ? { usuarioLiderId: form.usuarioLiderId } : {}),
      }
      editando
        ? await fichasService.actualizar(editando.id, datos)
        : await fichasService.crear(datos)
      toast.success(editando ? 'Ficha actualizada' : 'Ficha creada')
      setModal(false)
      cargar()
    } catch (e) {
      const msg = e?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(' | ') : msg || 'Error al guardar la ficha.')
    } finally { setCargando(false) }
  }

  const confirmarEliminar = async () => {
    try { await fichasService.eliminar(eliminar.id); toast.success('Ficha eliminada'); setEliminar(null); cargar() }
    catch { toast.error('Error al eliminar la ficha'); setEliminar(null) }
  }

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 page-title">Fichas</h1>
              <p className="text-sm text-gray-500 mt-1">Gestiona las fichas de formación y sus instructores líderes.</p>
            </div>
            <Boton variante="primario" className="flex items-center gap-2" onClick={() => abrir()}>
              <FiPlus size={16} /> Añadir Ficha
            </Boton>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#39A900]">
                  {['Código Ficha', 'Programa', 'Fecha Inicio', 'Fecha Fin', 'Instructor Líder', 'Estado', 'Acciones'].map(c => (
                    <th key={c} className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lista.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">Sin fichas registradas</td></tr>
                ) : lista.map(f => (
                  <tr key={f.id} className="hover:bg-[#39A900]/5 transition-colors">
                    <td className="px-5 py-4 font-mono text-sm text-gray-900">{f.codigoFicha}</td>
                    <td className="px-5 py-4 text-gray-600">{f.programa?.nombre ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-600">{f.fechaInicio?.slice(0, 10) ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-600">{f.fechaFin?.slice(0, 10) ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-600">{f.usuarioLider?.nombre ?? '—'}</td>
                    <td className="px-5 py-4">
                      <Badge variante={f.estado === 'activo' ? 'success' : 'default'}>{f.estado}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <AccionesFila onEditar={() => abrir(f)} onEliminar={() => setEliminar(f)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>

      <ModalFormularioSimple
        titulo={editando ? 'Editar Ficha' : 'Añadir Ficha'}
        visible={modal}
        onGuardar={guardar}
        onCerrar={() => setModal(false)}
        error={error}
        cargando={cargando}
      >
        <InputTexto label="Código de Ficha *" value={form.codigoFicha} onChange={e => setForm({ ...form, codigoFicha: e.target.value })} placeholder="Ej: 2977923" />
        <SelectOpcion label="Programa *" placeholder="Selecciona un programa" options={programas} value={form.programaId} onChange={e => setForm({ ...form, programaId: e.target.value })} name="programaId" />
        <InputFecha label="Fecha de Inicio *" name="fechaInicio" value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })} minAnio={2015} maxAnio={2035} />
        <InputFecha label="Fecha de Fin *" name="fechaFin" value={form.fechaFin} onChange={e => setForm({ ...form, fechaFin: e.target.value })} minAnio={2015} maxAnio={2035} />
        <SelectOpcion label="Instructor Líder" placeholder="Selecciona un instructor (opcional)" options={usuarios} value={form.usuarioLiderId} onChange={e => setForm({ ...form, usuarioLiderId: e.target.value })} name="usuarioLiderId" />
        <SelectOpcion label="Estado" options={ESTADOS} value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} name="estado" />
      </ModalFormularioSimple>

      {eliminar && <ModalConfirmacion mensaje={`¿Eliminar la ficha "${eliminar.codigoFicha}"?`} onConfirmar={confirmarEliminar} onCancelar={() => setEliminar(null)} />}
    </>
  )
}
