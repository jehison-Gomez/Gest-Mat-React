import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiShield, FiLock, FiCheck, FiPlus } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { FormularioUsuario } from '@/components/organisms/FormularioUsuario/FormularioUsuario'
import { Breadcrumb } from '@/components/molecules/Breadcrumb/Breadcrumb'
import { usuariosService } from '@/services/usuariosService'
import { rolesService } from '@/services/rolesService'
import { permisosService } from '@/services/permisosService'
import { sedesService } from '@/services/sedesService'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'

const ETIQUETAS_ACCION = {
  leer: 'Ver', crear: 'Crear', actualizar: 'Editar', eliminar: 'Eliminar',
  aprobar: 'Aprobar', rechazar: 'Rechazar', devolver: 'Devolver',
  asignar_rol: 'Asignar Rol', asignar_permisos: 'Asignar Permisos',
}

const ETIQUETAS_MODULO = {
  dashboard:    'Panel Principal',
  areas:        'Áreas',
  materiales:   'Materiales',
  ubicaciones:  'Ubicaciones',
  prestamos:    'Préstamos',
  kardex:       'Kardex',
  movimientos:  'Movimientos',
  fichas:       'Fichas',
  programas:    'Programas',
  usuarios:     'Usuarios',
  roles:        'Roles',
  configuracion:'Configuración',
  reportes:     'Reportes',
}

const ORDEN_MODULOS = [
  'dashboard','areas','materiales','ubicaciones','prestamos',
  'kardex','movimientos','fichas','programas','usuarios',
  'roles','configuracion','reportes',
]

export default function EditarUsuarioPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const { isSuperAdmin } = useAuth()
  const [cargando, setCargando] = useState(false)
  const [valoresIniciales, setValoresIniciales] = useState({})
  const [roles, setRoles] = useState([])
  const [sedes, setSedes] = useState([])

  const [todosPermisos, setTodosPermisos] = useState([])
  const [permisosRol, setPermisosRol] = useState([])
  const [permisosAdicionales, setPermisosAdicionales] = useState([])
  const [rolActualId, setRolActualId] = useState(null)
  const [cargandoPermisos, setCargandoPermisos] = useState(true)

  useEffect(() => {
    if (isSuperAdmin) {
      sedesService.getAll()
        .then(data => {
          const lista = Array.isArray(data) ? data : data.data ?? []
          setSedes(lista.map(s => ({ value: s.id, label: s.nombre })))
        })
        .catch(() => {})
    }

    const cargarTodo = async () => {
      try {
        const [rolesData, usuarioData] = await Promise.all([
          rolesService.getAll(),
          usuariosService.getById(id),
        ])

        const listaRoles = Array.isArray(rolesData) ? rolesData : rolesData.data ?? []
        const rolesFiltrados = isSuperAdmin
          ? listaRoles.filter(r => r.nombre === 'administrador')
          : listaRoles.filter(r => r.nombre !== 'administrador')
        setRoles(rolesFiltrados.map(r => ({ value: r.id, label: r.nombre })))

        const u = usuarioData?.data ?? usuarioData
        const rolId = u.role?.id ?? u.rolId ?? ''
        setRolActualId(rolId)

        const partes = (u.nombre ?? '').split(' ')
        setValoresIniciales({
          rol: rolId,
          activo: u.estado === true || u.estado === 'activo' || u.estado === 1,
          nombres: partes[0] ?? '',
          apellidos: partes.slice(1).join(' ') ?? '',
          correo: u.correo ?? '',
          telefono: u.telefono ?? '',
          numeroDocumento: u.numeroDocumento ?? '',
          sedeId: u.sede?.id ?? u.sedeId ?? '',
        })
      } catch {
        toast.error('Error al cargar el usuario')
        navigate('/app/usuarios')
      }

      permisosService.getAll()
        .then(data => setTodosPermisos(Array.isArray(data) ? data : data.data ?? []))
        .catch(() => {})

      usuariosService.getPermisos(id)
        .then(data => {
          const perms = Array.isArray(data) ? data : data.data ?? []
          setPermisosRol(perms.filter(p => p.origen === 'rol').map(p => p.id))
          setPermisosAdicionales(perms.filter(p => p.origen === 'adicional').map(p => p.id))
        })
        .catch(() => {})
        .finally(() => setCargandoPermisos(false))
    }
    cargarTodo()
  }, [id])

  const handleRolChange = async (nuevoRolId) => {
    if (!nuevoRolId || nuevoRolId === rolActualId) return
    setRolActualId(nuevoRolId)
    try {
      const perms = await rolesService.getPermisos(nuevoRolId)
      const lista = Array.isArray(perms) ? perms : perms.data ?? []
      const ids = lista.map(p => p.permiso?.id ?? p.permisoId ?? p.id).filter(Boolean)
      setPermisosRol(ids)
      setPermisosAdicionales(prev => prev.filter(pid => !ids.includes(pid)))
    } catch {
      setPermisosRol([])
    }
  }

  const toggleAdicional = (permisoId) => {
    if (permisosRol.includes(permisoId)) return
    setPermisosAdicionales(prev =>
      prev.includes(permisoId) ? prev.filter(p => p !== permisoId) : [...prev, permisoId]
    )
  }

  const handleGuardar = async (data) => {
    setCargando(true)
    try {
      await usuariosService.actualizar(id, {
        nombre:                 `${data.nombres} ${data.apellidos}`,
        correo:                 data.correo,
        telefono:               data.telefono,
        numeroDocumento:        data.numeroDocumento,
        rolId:                  data.rol,
        estado:                 data.activo ? 'activo' : 'inactivo',
        permisosAdicionalesIds: permisosAdicionales,
        ...(data.contrasena ? { contrasena: data.contrasena } : {}),
        ...(data.sedeId ? { sedeId: data.sedeId } : {}),
      })
      toast.success('Usuario actualizado exitosamente')
      navigate('/app/usuarios')
    } catch {
      toast.error('Error al actualizar el usuario')
    } finally {
      setCargando(false)
    }
  }

  const permisosAgrupados = ORDEN_MODULOS.reduce((acc, mod) => {
    const items = todosPermisos.filter(p => p.modulo === mod)
    if (items.length > 0) acc[mod] = items
    return acc
  }, {})

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Usuarios', to: '/app/usuarios' }, { label: 'Editar Usuario' }]} />
        <div className="max-w-3xl mx-auto w-full space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 page-title">Editar Usuario</h1>
            <p className="text-sm text-gray-500 mt-1">Modifica los datos del usuario seleccionado.</p>
          </div>

          <FormularioUsuario
            modo="editar"
            valoresIniciales={valoresIniciales}
            roles={roles}
            sedes={sedes}
            onGuardar={handleGuardar}
            onCancelar={() => navigate('/app/usuarios')}
            cargando={cargando}
            onRolChange={handleRolChange}
          />

          {/* Permisos */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <FiShield size={15} className="text-[#39A900]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-gray-900">Permisos del Usuario</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Los permisos del rol se muestran en verde. Puedes agregar accesos adicionales para este usuario específico.
                </p>
              </div>
              {!cargandoPermisos && permisosAdicionales.length > 0 && (
                <span className="flex-shrink-0 inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  <FiPlus size={10} /> {permisosAdicionales.length} extra
                </span>
              )}
            </div>

            <div className="p-6">
              {cargandoPermisos ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <span className="w-4 h-4 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" />
                  Cargando permisos...
                </div>
              ) : todosPermisos.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">
                  No hay permisos disponibles. Créalos primero en{' '}
                  <span className="text-green-600 font-medium">Configuración → Permisos</span>.
                </p>
              ) : (
                <div className="space-y-5">
                  {/* Leyenda */}
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 border border-green-300">
                        <FiLock size={8} className="text-[#39A900]" />
                      </span>
                      Del rol seleccionado
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 border border-blue-300">
                        <FiCheck size={8} className="text-blue-700" />
                      </span>
                      Adicional (solo este usuario)
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200 inline-block" />
                      Disponible
                    </span>
                  </div>

                  {/* Módulos */}
                  <div className="space-y-3">
                    {Object.entries(permisosAgrupados).map(([modulo, items]) => {
                      const adicEnModulo = items.filter(p => permisosAdicionales.includes(p.id)).length
                      const rolEnModulo  = items.filter(p => permisosRol.includes(p.id)).length
                      return (
                        <div key={modulo} className="rounded-xl border border-gray-100 overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              {ETIQUETAS_MODULO[modulo] ?? modulo}
                            </span>
                            <div className="flex items-center gap-2">
                              {rolEnModulo > 0 && (
                                <span className="text-xs text-green-600 font-medium">
                                  {rolEnModulo} del rol
                                </span>
                              )}
                              {adicEnModulo > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                                  +{adicEnModulo}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 p-3">
                            {items.map(p => {
                              const esRol       = permisosRol.includes(p.id)
                              const esAdicional = permisosAdicionales.includes(p.id)
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => toggleAdicional(p.id)}
                                  disabled={esRol}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                                    esRol
                                      ? 'bg-green-50 text-[#39A900] border-green-200 cursor-default'
                                      : esAdicional
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm cursor-pointer hover:bg-blue-700'
                                      : 'bg-white text-gray-500 border-gray-200 cursor-pointer hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                                  }`}
                                >
                                  {esRol
                                    ? <FiLock size={10} />
                                    : esAdicional
                                    ? <FiCheck size={10} />
                                    : <FiPlus size={10} />
                                  }
                                  {ETIQUETAS_ACCION[p.accion] ?? p.accion}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <p className="text-xs text-gray-400">
                    Los permisos adicionales se guardan al hacer clic en <strong>Guardar</strong> en el formulario de arriba.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
