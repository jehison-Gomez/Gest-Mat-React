import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiUser, FiMail, FiPhone, FiLock, FiCheckCircle, FiEdit3, FiShield } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { InputIcono } from '@/components/atoms/InputIcono/InputIcono'
import { InputPassword } from '@/components/atoms/InputPassword/InputPassword'
import { Boton } from '@/components/atoms/Boton/Boton'
import { Avatar } from '@/components/atoms/Avatar/Avatar'
import { usuariosService } from '@/services/usuariosService'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const schemaInfo = z.object({
  nombre:   z.string().min(2, 'El nombre es requerido'),
  correo:   z.string().email('Correo inválido').min(1, 'El correo es requerido'),
  telefono: z.string().min(7, 'Teléfono inválido'),
})

const schemaPassword = z.object({
  contrasena: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmar:  z.string().min(1, 'Confirma la contraseña'),
}).refine((d) => d.contrasena === d.confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar'],
})

const LABEL_ROL = {
  administrador:       'Administrador del Sistema',
  instructor_encargado:'Instructor Encargado',
  instructor:          'Instructor',
  vocero:              'Vocero',
  aprendiz:            'Aprendiz',
}

const LABEL_MODULO = {
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

const LABEL_ACCION = {
  leer:             'Ver',
  crear:            'Crear',
  actualizar:       'Editar',
  eliminar:         'Eliminar',
  aprobar:          'Aprobar',
  rechazar:         'Rechazar',
  devolver:         'Registrar devolución',
  asignar_rol:      'Asignar rol',
  asignar_permisos: 'Asignar permisos',
}

const ORDEN_MODULOS = [
  'dashboard','areas','materiales','ubicaciones','prestamos',
  'kardex','movimientos','fichas','programas','usuarios',
  'roles','configuracion','reportes',
]

const SeccionCard = ({ icono: Icono, titulo, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
    <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
      <Icono size={18} className="text-[#39A900]" />
      <h3 className="text-base font-semibold text-gray-900">{titulo}</h3>
    </div>
    {children}
  </div>
)

export default function MiPerfilPage() {
  const { user, rol, permisos } = useAuth()
  const toast = useToast()
  const [guardandoInfo, setGuardandoInfo] = useState(false)
  const [guardandoPass, setGuardandoPass] = useState(false)
  const [exitoInfo, setExitoInfo] = useState(false)
  const [exitoPass, setExitoPass] = useState(false)

  const infoForm = useForm({
    resolver: zodResolver(schemaInfo),
    defaultValues: {
      nombre:   user?.nombre ?? '',
      correo:   user?.correo ?? '',
      telefono: '',
    },
  })

  const passForm = useForm({
    resolver: zodResolver(schemaPassword),
    defaultValues: { contrasena: '', confirmar: '' },
  })

  const guardarInfo = async (data) => {
    setGuardandoInfo(true)
    setExitoInfo(false)
    try {
      await usuariosService.actualizar(user.id, {
        nombre:   data.nombre.trim(),
        correo:   data.correo.trim().toLowerCase(),
        telefono: data.telefono.trim(),
      })
      const actualizado = { ...user, nombre: data.nombre.trim(), correo: data.correo.trim().toLowerCase() }
      localStorage.setItem('user', JSON.stringify(actualizado))
      localStorage.setItem(`perfil_completado_${user.id}`, '1')
      setExitoInfo(true)
      toast.success('Información actualizada correctamente')
    } catch (e) {
      const msg = e?.response?.data?.message
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Error al actualizar')
    } finally {
      setGuardandoInfo(false)
    }
  }

  const guardarPassword = async (data) => {
    setGuardandoPass(true)
    setExitoPass(false)
    try {
      await usuariosService.actualizar(user.id, { contrasena: data.contrasena })
      passForm.reset()
      setExitoPass(true)
      toast.success('Contraseña actualizada correctamente')
    } catch (e) {
      const msg = e?.response?.data?.message
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Error al actualizar la contraseña')
    } finally {
      setGuardandoPass(false)
    }
  }

  // Agrupar permisos por módulo
  const permisosAgrupados = ORDEN_MODULOS.reduce((acc, modulo) => {
    const items = (permisos ?? []).filter(p => p.modulo === modulo)
    if (items.length > 0) acc[modulo] = items
    return acc
  }, {})

  const rolPermisos      = (permisos ?? []).filter(p => p.origen === 'rol')
  const adicionalesCount = (permisos ?? []).filter(p => p.origen === 'adicional').length

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 page-title">Mi Perfil</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tu información personal y seguridad de la cuenta.</p>
        </div>

        {/* Tarjeta de identidad */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-xl p-6 text-white flex items-center gap-5">
          <Avatar nombre={user?.nombre ?? ''} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold truncate">{user?.nombre ?? '—'}</p>
            <p className="text-green-200 text-sm truncate">{user?.correo ?? '—'}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-block bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                {LABEL_ROL[rol] ?? rol ?? 'Usuario'}
              </span>
              {adicionalesCount > 0 && (
                <span className="inline-block bg-blue-400/30 text-white text-xs font-medium px-3 py-1 rounded-full">
                  +{adicionalesCount} permisos adicionales
                </span>
              )}
            </div>
          </div>
          <FiEdit3 size={20} className="opacity-50 shrink-0" />
        </div>

        {/* Información personal */}
        <SeccionCard icono={FiUser} titulo="Información Personal">
          <form onSubmit={infoForm.handleSubmit(guardarInfo)} className="space-y-4">
            <InputIcono
              label="Nombre completo"
              requerido
              icono={FiUser}
              placeholder="Tu nombre completo"
              {...infoForm.register('nombre')}
              error={infoForm.formState.errors.nombre?.message}
            />
            <div>
              <InputIcono
                label="Correo electrónico"
                requerido
                type="email"
                icono={FiMail}
                placeholder="tu@gmail.com"
                {...infoForm.register('correo')}
                error={infoForm.formState.errors.correo?.message}
              />
              <p className="text-xs text-gray-400 mt-1 ml-1">
                Este correo se usa para recuperar tu contraseña.
              </p>
            </div>
            <InputIcono
              label="Teléfono / Celular"
              requerido
              type="tel"
              icono={FiPhone}
              placeholder="+57 300 000 0000"
              {...infoForm.register('telefono')}
              error={infoForm.formState.errors.telefono?.message}
            />
            <div className="flex items-center gap-3 pt-1">
              <Boton type="submit" variante="primario" disabled={guardandoInfo}>
                {guardandoInfo ? 'Guardando...' : 'Guardar cambios'}
              </Boton>
              {exitoInfo && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <FiCheckCircle size={15} /> Guardado
                </span>
              )}
            </div>
          </form>
        </SeccionCard>

        {/* Seguridad */}
        <SeccionCard icono={FiLock} titulo="Cambiar Contraseña">
          <form onSubmit={passForm.handleSubmit(guardarPassword)} className="space-y-4">
            <p className="text-sm text-gray-500">
              Deja los campos en blanco si no deseas cambiar la contraseña.
            </p>
            <InputPassword
              label="Nueva contraseña"
              placeholder="Mínimo 8 caracteres"
              {...passForm.register('contrasena')}
              error={passForm.formState.errors.contrasena?.message}
            />
            <InputPassword
              label="Confirmar nueva contraseña"
              placeholder="Repite la contraseña"
              {...passForm.register('confirmar')}
              error={passForm.formState.errors.confirmar?.message}
            />
            <div className="flex items-center gap-3 pt-1">
              <Boton type="submit" variante="primario" disabled={guardandoPass}>
                {guardandoPass ? 'Actualizando...' : 'Actualizar contraseña'}
              </Boton>
              {exitoPass && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <FiCheckCircle size={15} /> Actualizada
                </span>
              )}
            </div>
          </form>
        </SeccionCard>

        {/* Mis Permisos */}
        <SeccionCard icono={FiShield} titulo="Mis Permisos">
          {!permisos || permisos.length === 0 ? (
            <p className="text-sm text-gray-400">
              No tienes permisos cargados. Cierra sesión y vuelve a iniciarla para actualizarlos.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                  Incluido en tu rol ({rolPermisos.length})
                </span>
                {adicionalesCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                    Permisos adicionales ({adicionalesCount})
                  </span>
                )}
              </div>

              {Object.entries(permisosAgrupados).map(([modulo, items]) => (
                <div key={modulo} className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {LABEL_MODULO[modulo] ?? modulo}
                  </div>
                  <div className="flex flex-wrap gap-2 p-3">
                    {items.map(p => (
                      <span
                        key={p.id}
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                          p.origen === 'adicional'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-green-50 text-[#39A900] border border-green-200'
                        }`}
                      >
                        {LABEL_ACCION[p.accion] ?? p.accion}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SeccionCard>
      </div>
    </DashboardLayout>
  )
}
