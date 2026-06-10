import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { InputTexto } from '@/components/atoms/InputTexto/InputTexto'
import { InputPassword } from '@/components/atoms/InputPassword/InputPassword'
import { Boton } from '@/components/atoms/Boton/Boton'
import { authService } from '@/services/authService'
import { useToast } from '@/hooks/useToast'
import { FiCheckCircle } from 'react-icons/fi'

const loginSchema = z.object({
  correo: z.string().email('Email inválido').min(1, 'Email es requerido'),
  contrasena: z
    .string()
    .min(6, 'Contraseña debe tener mínimo 6 caracteres')
    .min(1, 'Contraseña es requerida'),
})

const recuperacionSchema = z.object({
  correo: z.string().email('Email inválido').min(1, 'Email es requerido'),
})

const codigoSchema = z.object({
  codigo: z
    .string()
    .min(1, 'Código es requerido')
    .length(6, 'Código debe tener 6 caracteres'),
})

const restablecerSchema = z.object({
  contrasena: z
    .string()
    .min(6, 'Contraseña debe tener mínimo 6 caracteres')
    .min(1, 'Contraseña es requerida'),
  confirmar: z
    .string()
    .min(1, 'Confirmación es requerida'),
}).refine((data) => data.contrasena === data.confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar'],
})

export const LoginForm = ({ onLoginSuccess }) => {
  const toast = useToast()
  const [flujo, setFlujo] = useState('login')
  const [loading, setLoading] = useState(false)
  const [correoRecuperacion, setCorreoRecuperacion] = useState('')

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
  })

  const recuperacionForm = useForm({
    resolver: zodResolver(recuperacionSchema),
  })

  const codigoForm = useForm({
    resolver: zodResolver(codigoSchema),
  })

  const restablecerForm = useForm({
    resolver: zodResolver(restablecerSchema),
  })

  const handleLogin = async (data) => {
    setLoading(true)
    try {
      const response = await authService.login(data.correo, data.contrasena)
      const user = {
        id: response.id,
        nombre: response.nombre,
        correo: response.correo,
        rol: response.rol,
      }
      localStorage.setItem('user', JSON.stringify(user))
      toast.success('Bienvenido ' + response.nombre)
      onLoginSuccess()
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Credenciales incorrectas')
      } else if (error.message === 'Network Error') {
        toast.error('Error de conexión. Verifica que el servidor esté disponible')
      } else {
        toast.error('Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSolicitarRecuperacion = async (data) => {
    setLoading(true)
    try {
      await authService.solicitarRecuperacion(data.correo)
      setCorreoRecuperacion(data.correo)
      toast.info('Código enviado a tu email')
      setFlujo('codigo')
    } catch (error) {
      toast.error('Error al solicitar recuperación')
    } finally {
      setLoading(false)
    }
  }

  const handleVerificarCodigo = async (data) => {
    setLoading(true)
    try {
      await authService.verificarCodigo(correoRecuperacion, data.codigo)
      toast.success('Código verificado')
      setFlujo('restablecer')
    } catch (error) {
      toast.error('Código inválido')
    } finally {
      setLoading(false)
    }
  }

  const handleRestablecer = async (data) => {
    setLoading(true)
    try {
      await authService.restablecerContrasena(
        correoRecuperacion,
        codigoForm.getValues('codigo'),
        data.contrasena
      )
      toast.success('Contraseña restablecida')
      setFlujo('exito')
    } catch (error) {
      toast.error('Error al restablecer contraseña')
    } finally {
      setLoading(false)
    }
  }

  if (flujo === 'exito') {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <FiCheckCircle size={56} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Contraseña restablecida
          </h2>
          <p className="text-gray-600 mt-2">
            Tu contraseña ha sido restablecida exitosamente
          </p>
        </div>
        <Boton
          variante="primario"
          onClick={() => {
            setFlujo('login')
            loginForm.reset()
          }}
        >
          Volver al login
        </Boton>
      </div>
    )
  }

  if (flujo === 'restablecer') {
    return (
      <form onSubmit={restablecerForm.handleSubmit(handleRestablecer)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Restablecer contraseña
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Ingresa tu nueva contraseña
          </p>
        </div>

<InputPassword
          label="Nueva contraseña"
          placeholder="••••••••"
          {...restablecerForm.register('contrasena')}
          error={restablecerForm.formState.errors.contrasena?.message}
        />

        <InputPassword
          label="Confirmar contraseña"
          placeholder="••••••••"
          {...restablecerForm.register('confirmar')}
          error={restablecerForm.formState.errors.confirmar?.message}
        />

        <Boton
          variante="primario"
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
        </Boton>

        <button
          type="button"
          onClick={() => {
            setFlujo('login')
          }}
          className="text-green-600 hover:text-green-700 text-sm underline"
        >
          Volver al login
        </button>
      </form>
    )
  }

  if (flujo === 'codigo') {
    return (
      <form onSubmit={codigoForm.handleSubmit(handleVerificarCodigo)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Verificar código</h2>
          <p className="text-gray-600 text-sm mt-1">
            Ingresa el código enviado a {correoRecuperacion}
          </p>
        </div>

<InputTexto
          label="Código de verificación"
          placeholder="000000"
          maxLength="6"
          {...codigoForm.register('codigo')}
          error={codigoForm.formState.errors.codigo?.message}
        />

        <Boton
          variante="primario"
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Verificando...' : 'Verificar código'}
        </Boton>

        <button
          type="button"
          onClick={() => {
            setFlujo('correo')
            setErrorMsg('')
          }}
          className="text-green-600 hover:text-green-700 text-sm underline"
        >
          Volver atrás
        </button>
      </form>
    )
  }

  if (flujo === 'correo') {
    return (
      <form onSubmit={recuperacionForm.handleSubmit(handleSolicitarRecuperacion)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Recuperar contraseña
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Ingresa tu email para recibir un código de recuperación
          </p>
        </div>

<InputTexto
          label="Email"
          type="email"
          placeholder="tu@email.com"
          {...recuperacionForm.register('correo')}
          error={recuperacionForm.formState.errors.correo?.message}
        />

        <Boton
          variante="primario"
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar código'}
        </Boton>

        <button
          type="button"
          onClick={() => {
            setFlujo('login')
          }}
          className="text-green-600 hover:text-green-700 text-sm underline"
        >
          Volver al login
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Iniciar sesión</h2>
        <p className="text-gray-600 text-sm mt-1">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <InputTexto
        label="Email"
        type="email"
        placeholder="tu@email.com"
        {...loginForm.register('correo')}
        error={loginForm.formState.errors.correo?.message}
      />

      <InputPassword
        label="Contraseña"
        placeholder="••••••••"
        {...loginForm.register('contrasena')}
        error={loginForm.formState.errors.contrasena?.message}
      />

      <Boton
        variante="primario"
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Boton>

      <button
        type="button"
        onClick={() => {
          setFlujo('correo')
          setErrorMsg('')
        }}
        className="text-green-600 hover:text-green-700 text-sm underline w-full text-center"
      >
        ¿Olvidaste tu contraseña?
      </button>
    </form>
  )
}
