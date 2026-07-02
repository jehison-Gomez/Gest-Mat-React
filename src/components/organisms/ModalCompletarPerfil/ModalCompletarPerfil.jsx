import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiMail, FiUser, FiPhone, FiCheckCircle, FiLock } from 'react-icons/fi'
import { Boton } from '@/components/atoms/Boton/Boton'
import { InputIcono } from '@/components/atoms/InputIcono/InputIcono'
import { InputPassword } from '@/components/atoms/InputPassword/InputPassword'
import { usuariosService } from '@/services/usuariosService'
import { useToast } from '@/hooks/useToast'

const schema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  correo: z.string().email('Ingresa un correo válido'),
  telefono: z.string().min(7, 'Ingresa un teléfono válido'),
  contrasena: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmar: z.string().min(1, 'Confirma la contraseña'),
}).refine((d) => d.contrasena === d.confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar'],
})

const CLAVE_COMPLETADO = (id) => `perfil_completado_${id}`

export const ModalCompletarPerfil = ({ user, onCompletado }) => {
  const toast = useToast()
  const [cargando, setCargando] = useState(false)
  const [listo, setListo] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre:    user?.nombre ?? '',
      correo:    user?.correo ?? '',
      telefono:  '',
      contrasena: '',
      confirmar:  '',
    },
  })

  const guardar = async (data) => {
    setCargando(true)
    try {
      await usuariosService.actualizar(user.id, {
        nombre:     data.nombre.trim(),
        correo:     data.correo.trim().toLowerCase(),
        telefono:   data.telefono.trim(),
        contrasena: data.contrasena,
      })

      const userActualizado = {
        ...user,
        nombre: data.nombre.trim(),
        correo: data.correo.trim().toLowerCase(),
      }
      localStorage.setItem('user', JSON.stringify(userActualizado))
      localStorage.setItem(CLAVE_COMPLETADO(user.id), '1')

      setListo(true)
    } catch (e) {
      const msg = e?.response?.data?.message
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Error al guardar el perfil')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo bloqueante — no se puede cerrar haciendo clic */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Tarjeta */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header verde */}
        <div className="bg-[#39A900] px-8 py-5 text-white flex-shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <FiUser size={16} />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase opacity-80">
              Primer acceso
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1">Configura tu cuenta</h2>
          <p className="text-green-100 text-sm mt-1">
            Actualiza tus datos y crea una contraseña personal para continuar.
          </p>
        </div>

        {/* Cuerpo con scroll si hace falta */}
        <div className="px-8 py-6 overflow-y-auto">
          {listo ? (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <FiCheckCircle size={32} className="text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">¡Cuenta configurada!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Tus datos quedaron guardados. Usa tu correo y nueva contraseña para los próximos ingresos.
                </p>
              </div>
              <Boton variante="primario" className="w-full" onClick={onCompletado}>
                Continuar al sistema
              </Boton>
            </div>
          ) : (
            <form onSubmit={handleSubmit(guardar)} className="space-y-4">
              <InputIcono
                label="Nombre completo"
                requerido
                icono={FiUser}
                placeholder="Tu nombre completo"
                {...register('nombre')}
                error={errors.nombre?.message}
              />

              <div>
                <InputIcono
                  label="Tu correo Gmail"
                  requerido
                  type="email"
                  icono={FiMail}
                  placeholder="ejemplo@gmail.com"
                  {...register('correo')}
                  error={errors.correo?.message}
                />
                <p className="text-xs text-gray-400 mt-1 ml-1">
                  Usarás este correo para recuperar tu contraseña.
                </p>
              </div>

              <InputIcono
                label="Teléfono / Celular"
                requerido
                type="tel"
                icono={FiPhone}
                placeholder="+57 300 000 0000"
                {...register('telefono')}
                error={errors.telefono?.message}
              />

              <div className="border-t border-gray-100 pt-4 space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiLock size={14} />
                  <span className="text-xs font-semibold uppercase tracking-wide">Nueva contraseña</span>
                </div>

                <InputPassword
                  label="Contraseña"
                  placeholder="Mínimo 8 caracteres"
                  {...register('contrasena')}
                  error={errors.contrasena?.message}
                />

                <InputPassword
                  label="Confirmar contraseña"
                  placeholder="Repite la contraseña"
                  {...register('confirmar')}
                  error={errors.confirmar?.message}
                />
              </div>

              <div className="pt-2">
                <Boton
                  type="submit"
                  variante="primario"
                  className="w-full"
                  disabled={cargando}
                >
                  {cargando ? 'Guardando...' : 'Guardar y continuar'}
                </Boton>
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem(CLAVE_COMPLETADO(user.id), '1')
                    onCompletado()
                  }}
                  className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-3 py-1"
                >
                  Continuar sin cambiar los datos
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export const debeCompletarPerfil = (user) => {
  if (!user?.id) return false
  const key = `perfil_completado_${user.id}`
  return !localStorage.getItem(key) && !sessionStorage.getItem(key)
}
