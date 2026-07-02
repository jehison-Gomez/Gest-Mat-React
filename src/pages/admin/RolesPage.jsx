import { useState, useEffect } from 'react'
import { FiPlus, FiShield } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { ModalConfirmacion } from '@/components/molecules/ModalConfirmacion/ModalConfirmacion'
import { Badge } from '@/components/atoms/Badge/Badge'
import { Boton } from '@/components/atoms/Boton/Boton'
import { InputTexto } from '@/components/atoms/InputTexto/InputTexto'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { AccionesFila } from '@/components/molecules/AccionesFila/AccionesFila'
import { rolesService } from '@/services/rolesService'
import { permisosService } from '@/services/permisosService'
import { useToast } from '@/hooks/useToast'

const VACIO = { nombre: '', descripcion: '', estado: 'activo' }
const ESTADOS = [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }]

const ETIQUETAS_ACCION = {
  crear: 'Crear', leer: 'Leer', actualizar: 'Actualizar', eliminar: 'Eliminar',
  aprobar: 'Aprobar', rechazar: 'Rechazar', devolver: 'Devolver',
  asignar_rol: 'Asignar Rol', asignar_permisos: 'Asignar Permisos',
}

export default function RolesPage() {
  const toast = useToast()
  const [lista, setLista] = useState([])
  const [todosPermisos, setTodosPermisos] = useState([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [eliminar, setEliminar] = useState(null)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const [rolesData, permisosData] = await Promise.all([
        rolesService.getAll(),
        permisosService.getAll(),
      ])
      setLista(Array.isArray(rolesData) ? rolesData : rolesData.data ?? [])
      setTodosPermisos(Array.isArray(permisosData) ? permisosData : permisosData.data ?? [])
    } catch { toast.error('Error al cargar datos') }
  }

  const abrir = async (item = null) => {
    setEditando(item)
    setForm(item
      ? { nombre: item.nombre ?? '', descripcion: item.descripcion ?? '', estado: item.estado ?? 'activo' }
      : VACIO
    )
    setError('')

    if (item) {
      try {
        const perms = await rolesService.getPermisos(item.id)
        setPermisosSeleccionados((perms ?? []).map(p => p.id ?? p.permisoId ?? p.permiso?.id))
      } catch {
        setPermisosSeleccionados([])
      }
    } else {
      setPermisosSeleccionados([])
    }

    setModal(true)
  }

  const togglePermiso = (id) => {
    setPermisosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const toggleModulo = (permisosDelModulo) => {
    const ids = permisosDelModulo.map(p => p.id)
    const todosChecked = ids.every(id => permisosSeleccionados.includes(id))
    if (todosChecked) {
      setPermisosSeleccionados(prev => prev.filter(id => !ids.includes(id)))
    } else {
      setPermisosSeleccionados(prev => [...new Set([...prev, ...ids])])
    }
  }

  const guardar = async () => {
    if (!form.nombre || form.nombre.trim().length < 2) return setError('El nombre debe tener al menos 2 caracteres.')
    if (!form.descripcion) return setError('La descripción es obligatoria.')
    setCargando(true)
    try {
      const datos = {
        nombre:      form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        estado:      form.estado,
        permisosIds: permisosSeleccionados,
      }
      editando
        ? await rolesService.actualizar(editando.id, datos)
        : await rolesService.crear(datos)
      toast.success(editando ? 'Rol actualizado' : 'Rol creado')
      setModal(false)
      cargar()
    } catch (e) {
      const msg = e?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(' | ') : msg || 'Error al guardar el rol.')
    } finally { setCargando(false) }
  }

  const confirmarEliminar = async () => {
    try { await rolesService.eliminar(eliminar.id); toast.success('Rol eliminado'); setEliminar(null); cargar() }
    catch { toast.error('Error al eliminar el rol'); setEliminar(null) }
  }

  // Agrupar permisos por módulo
  const permisosAgrupados = todosPermisos.reduce((acc, p) => {
    const mod = p.modulo ?? 'otros'
    if (!acc[mod]) acc[mod] = []
    acc[mod].push(p)
    return acc
  }, {})

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 page-title">Roles</h1>
              <p className="text-sm text-gray-500 mt-1">Gestiona los roles del sistema y sus niveles de acceso.</p>
            </div>
            <Boton variante="primario" className="flex items-center gap-2" onClick={() => abrir()}>
              <FiPlus size={16} /> Añadir Rol
            </Boton>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#39A900]">
                  {['Nombre', 'Descripción', 'Estado', 'Acciones'].map(c => (
                    <th key={c} className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lista.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">Sin roles registrados</td></tr>
                ) : lista.map(r => (
                  <tr key={r.id} className="hover:bg-[#39A900]/5 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{r.nombre}</td>
                    <td className="px-5 py-4 text-gray-600 max-w-xs truncate">{r.descripcion}</td>
                    <td className="px-5 py-4"><Badge variante={r.estado === 'activo' ? 'success' : 'default'}>{r.estado}</Badge></td>
                    <td className="px-5 py-4">
                      <AccionesFila onEditar={() => abrir(r)} onEliminar={() => setEliminar(r)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>

      {/* Modal crear/editar rol */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{editando ? 'Editar Rol' : 'Añadir Rol'}</h2>
            </div>

            {/* Cuerpo con scroll */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
              )}

              <InputTexto label="Nombre *" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Instructor Encargado" />
              <InputTexto label="Descripción *" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Describe las responsabilidades del rol" />
              <SelectOpcion label="Estado" options={ESTADOS} value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} name="estado" />

              {/* Sección de permisos */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiShield size={15} className="text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">Permisos predeterminados del rol</span>
                  <span className="ml-auto text-xs text-gray-400">{permisosSeleccionados.length} seleccionados</span>
                </div>

                {Object.keys(permisosAgrupados).length === 0 ? (
                  <p className="text-sm text-gray-400">No hay permisos disponibles. Créalos primero en la sección Permisos.</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(permisosAgrupados).map(([modulo, permisos]) => {
                      const todosChecked = permisos.every(p => permisosSeleccionados.includes(p.id))
                      const algunoChecked = permisos.some(p => permisosSeleccionados.includes(p.id))
                      return (
                        <div key={modulo} className="border border-gray-100 rounded-lg overflow-hidden">
                          {/* Cabecera del módulo */}
                          <div
                            className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 cursor-pointer select-none"
                            onClick={() => toggleModulo(permisos)}
                          >
                            <input
                              type="checkbox"
                              checked={todosChecked}
                              ref={el => { if (el) el.indeterminate = algunoChecked && !todosChecked }}
                              onChange={() => toggleModulo(permisos)}
                              className="accent-green-600 w-4 h-4"
                              onClick={e => e.stopPropagation()}
                            />
                            <span className="text-sm font-semibold text-gray-700 capitalize">{modulo}</span>
                            <span className="ml-auto text-xs text-gray-400">
                              {permisos.filter(p => permisosSeleccionados.includes(p.id)).length}/{permisos.length}
                            </span>
                          </div>
                          {/* Permisos del módulo */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3">
                            {permisos.map(p => (
                              <label
                                key={p.id}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                                  permisosSeleccionados.includes(p.id)
                                    ? 'border-green-300 bg-green-50 text-green-800'
                                    : 'border-gray-100 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={permisosSeleccionados.includes(p.id)}
                                  onChange={() => togglePermiso(p.id)}
                                  className="accent-green-600 w-3.5 h-3.5 flex-shrink-0"
                                />
                                <span>{ETIQUETAS_ACCION[p.accion] ?? p.accion}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
              <Boton variante="secundario" onClick={() => setModal(false)}>Cancelar</Boton>
              <Boton variante="primario" onClick={guardar} disabled={cargando}>
                {cargando ? 'Guardando...' : editando ? 'Guardar' : 'Crear Rol'}
              </Boton>
            </div>
          </div>
        </div>
      )}

      {eliminar && (
        <ModalConfirmacion
          mensaje={`¿Eliminar el rol "${eliminar.nombre}"?`}
          onConfirmar={confirmarEliminar}
          onCancelar={() => setEliminar(null)}
        />
      )}
    </>
  )
}
