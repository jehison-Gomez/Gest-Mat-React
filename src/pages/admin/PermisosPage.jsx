import { useState, useEffect } from 'react'
import { FiPlus } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { ModalFormularioSimple } from '@/components/organisms/ModalFormularioSimple/ModalFormularioSimple'
import { ModalConfirmacion } from '@/components/molecules/ModalConfirmacion/ModalConfirmacion'
import { Boton } from '@/components/atoms/Boton/Boton'
import { InputTexto } from '@/components/atoms/InputTexto/InputTexto'
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar'
import { Badge } from '@/components/atoms/Badge/Badge'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { AccionesFila } from '@/components/molecules/AccionesFila/AccionesFila'
import { permisosService } from '@/services/permisosService'
import { useToast } from '@/hooks/useToast'

const VACIO = { nombre: '', descripcion: '', modulo: '', accion: '', estado: 'activo' }

const ESTADOS = [
  { value: 'activo',   label: 'Activo'   },
  { value: 'inactivo', label: 'Inactivo' },
]

export default function PermisosPage() {
  const toast = useToast()
  const [lista, setLista] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [eliminar, setEliminar] = useState(null)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const data = await permisosService.getAll()
      setLista(Array.isArray(data) ? data : data.data ?? [])
    } catch { toast.error('Error al cargar permisos') }
  }

  const abrir = (item = null) => {
    setEditando(item)
    setForm(item ? { nombre: item.nombre ?? '', descripcion: item.descripcion ?? '', modulo: item.modulo ?? '', accion: item.accion ?? '', estado: item.estado ?? 'activo' } : VACIO)
    setError('')
    setModal(true)
  }

  const guardar = async () => {
    if (!form.nombre || form.nombre.trim().length < 2) return setError('El nombre debe tener al menos 2 caracteres.')
    if (!form.descripcion) return setError('La descripción es obligatoria.')
    if (!form.modulo || form.modulo.trim().length < 2) return setError('El módulo es obligatorio.')
    if (!form.accion || form.accion.trim().length < 2) return setError('La acción es obligatoria.')
    setCargando(true)
    try {
      const datos = { nombre: form.nombre.trim(), descripcion: form.descripcion.trim(), modulo: form.modulo.trim(), accion: form.accion.trim(), estado: form.estado }
      editando ? await permisosService.actualizar(editando.id, datos) : await permisosService.crear(datos)
      toast.success(editando ? 'Permiso actualizado' : 'Permiso creado')
      setModal(false)
      cargar()
    } catch (e) {
      const msg = e?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(' | ') : msg || 'Error al guardar.')
    } finally { setCargando(false) }
  }

  const confirmarEliminar = async () => {
    try { await permisosService.eliminar(eliminar.id); toast.success('Permiso eliminado'); setEliminar(null); cargar() }
    catch { toast.error('Error al eliminar'); setEliminar(null) }
  }

  const filtrados = lista.filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.modulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.accion?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 page-title">Permisos</h1>
            <p className="text-sm text-gray-500 mt-1">Gestiona los permisos de acceso por módulo y acción.</p>
          </div>

          <div className="w-full max-w-md">
            <SearchBar placeholder="Buscar por nombre, módulo o acción..." value={busqueda} onChange={setBusqueda} />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#39A900]">
                  {['Nombre', 'Descripción', 'Módulo', 'Acción', 'Estado', 'Acciones'].map(c => (
                    <th key={c} className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Sin permisos registrados</td></tr>
                ) : filtrados.map(p => (
                  <tr key={p.id} className="hover:bg-[#39A900]/5 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{p.nombre}</td>
                    <td className="px-5 py-4 text-gray-600 max-w-xs truncate">{p.descripcion}</td>
                    <td className="px-5 py-4 text-gray-600">{p.modulo}</td>
                    <td className="px-5 py-4 text-gray-600">{p.accion}</td>
                    <td className="px-5 py-4">
                      <Badge variante={p.estado === 'activo' ? 'success' : 'default'}>{p.estado ?? 'activo'}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <AccionesFila onEditar={() => abrir(p)} onEliminar={() => setEliminar(p)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>

      <ModalFormularioSimple titulo={editando ? 'Editar Permiso' : 'Añadir Permiso'} visible={modal} onGuardar={guardar} onCerrar={() => setModal(false)} error={error} cargando={cargando}>
        <InputTexto label="Nombre *" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Ver usuarios" />
        <InputTexto label="Descripción *" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej: Permite listar y consultar usuarios" />
        <InputTexto label="Módulo *" value={form.modulo} onChange={e => setForm({ ...form, modulo: e.target.value })} placeholder="Ej: usuarios" />
        <InputTexto label="Acción *" value={form.accion} onChange={e => setForm({ ...form, accion: e.target.value })} placeholder="Ej: leer" />
        <SelectOpcion label="Estado" options={ESTADOS} value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} name="estado" />
      </ModalFormularioSimple>

      {eliminar && <ModalConfirmacion mensaje={`¿Eliminar el permiso "${eliminar.nombre}"?`} onConfirmar={confirmarEliminar} onCancelar={() => setEliminar(null)} />}
    </>
  )
}
