import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  FiMail, FiLock, FiCheckCircle, FiArrowLeft,
  FiEye, FiEyeOff, FiShield, FiAlertCircle, FiAlertTriangle, FiWifiOff,
} from 'react-icons/fi'
import { authService } from '@/services/authService'
import { useToast } from '@/hooks/useToast'

/* ── Schemas ── */
const loginSchema = z.object({
  correo:     z.string().email('Correo inválido').min(1),
  contrasena: z.string().min(6, 'Mínimo 6 caracteres'),
})
const recuperacionSchema = z.object({
  correo: z.string().email('Correo inválido').min(1),
})
const codigoSchema = z.object({
  codigo: z.string().length(6, 'Debe tener 6 dígitos'),
})
const restablecerSchema = z.object({
  contrasena: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmar:  z.string().min(1),
}).refine(d => d.contrasena === d.confirmar, { message: 'No coinciden', path: ['confirmar'] })

/* ── Campo de texto con ícono ── */
const Field = ({ label, icon: Icon, error, type = 'text', ...rest }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-gray-700">{label}</label>
    <div className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-all duration-150
      ${error
        ? 'border-red-300 bg-red-50'
        : 'border-gray-200 bg-white hover:border-gray-300 focus-within:border-[#39A900] focus-within:ring-2 focus-within:ring-[#39A900]/15'
      }`}
    >
      <Icon size={15} className={`flex-shrink-0 ${error ? 'text-red-400' : 'text-gray-400'}`} />
      <input
        type={type}
        {...rest}
        className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
      />
    </div>
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <FiAlertCircle size={11} /> {error}
      </p>
    )}
  </div>
)

/* ── Campo de contraseña ── */
const PasswordField = ({ label, error, ...rest }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <div className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-all duration-150
        ${error
          ? 'border-red-300 bg-red-50'
          : 'border-gray-200 bg-white hover:border-gray-300 focus-within:border-[#39A900] focus-within:ring-2 focus-within:ring-[#39A900]/15'
        }`}
      >
        <FiLock size={15} className={`flex-shrink-0 ${error ? 'text-red-400' : 'text-gray-400'}`} />
        <input
          type={show ? 'text' : 'password'}
          {...rest}
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <FiAlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  )
}

/* ── Botón principal ── */
const PrimaryBtn = ({ children, loading, loadingText, ...rest }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm text-white
      bg-[#39A900] hover:bg-[#2d8200] active:bg-[#1e5a00]
      disabled:opacity-60 disabled:cursor-not-allowed
      shadow-sm shadow-[#39A900]/25
      transition-all duration-150"
    {...rest}
  >
    {loading
      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{loadingText}</>
      : children
    }
  </button>
)

/* ── Alerta de login ── */
const AlertaLogin = ({ tipo, mensaje }) => {
  const cfg = {
    error:    { bg: 'bg-red-50 border-red-200',    Icono: FiAlertCircle,   text: 'text-red-700',   ic: 'text-red-500'   },
    inactivo: { bg: 'bg-amber-50 border-amber-200', Icono: FiAlertTriangle, text: 'text-amber-800', ic: 'text-amber-500' },
    red:      { bg: 'bg-gray-50 border-gray-200',   Icono: FiWifiOff,       text: 'text-gray-700',  ic: 'text-gray-400'  },
  }[tipo] ?? { bg: 'bg-red-50 border-red-200', Icono: FiAlertCircle, text: 'text-red-700', ic: 'text-red-500' }
  const { Icono } = cfg

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${cfg.bg}`}>
      <Icono size={16} className={`flex-shrink-0 mt-0.5 ${cfg.ic}`} />
      <p className={`text-sm font-medium leading-snug ${cfg.text}`}>{mensaje}</p>
    </div>
  )
}

/* ── Botón volver ── */
const BackBtn = ({ onClick, label = 'Volver' }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center justify-center gap-1.5 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
  >
    <FiArrowLeft size={13} /> {label}
  </button>
)

/* ── Ícono de flujo ── */
const FlowIcon = ({ icon: Icon }) => (
  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#39A900]/10 mb-3">
    <Icon size={22} className="text-[#39A900]" />
  </div>
)

/* ════════════════════════════════════════════ */
export const LoginForm = ({ onLoginSuccess }) => {
  const toast = useToast()
  const [flujo,     setFlujo]     = useState('login')
  const [loading,   setLoading]   = useState(false)
  const [correoRec, setCorreoRec] = useState('')
  const [alerta,    setAlerta]    = useState(null)

  const loginForm  = useForm({ resolver: zodResolver(loginSchema) })
  const recForm    = useForm({ resolver: zodResolver(recuperacionSchema) })
  const codigoForm = useForm({ resolver: zodResolver(codigoSchema) })
  const resetForm  = useForm({ resolver: zodResolver(restablecerSchema) })

  const handleLogin = async (data) => {
    setLoading(true); setAlerta(null)
    try {
      const res = await authService.login(data.correo, data.contrasena)
      localStorage.setItem('user', JSON.stringify({
        id: res.id, nombre: res.nombre, correo: res.correo, rol: res.rol, sedeId: res.sedeId ?? null,
      }))
      toast.success('Bienvenido, ' + res.nombre)
      onLoginSuccess()
    } catch (err) {
      const msg = err.response?.data?.message
      if (msg === 'Usuario desactivado')
        setAlerta({ tipo: 'inactivo', mensaje: 'Tu cuenta está desactivada. Contacta al administrador.' })
      else if (err.response?.status === 401)
        setAlerta({ tipo: 'error', mensaje: 'Correo o contraseña incorrectos. Verifica tus datos.' })
      else if (err.message === 'Network Error')
        setAlerta({ tipo: 'red', mensaje: 'No se pudo conectar con el servidor.' })
      else
        setAlerta({ tipo: 'error', mensaje: 'Ocurrió un error inesperado. Intenta de nuevo.' })
    } finally { setLoading(false) }
  }

  const handleSolicitar = async (data) => {
    setLoading(true)
    try {
      await authService.solicitarRecuperacion(data.correo)
      setCorreoRec(data.correo)
      toast.info('Código enviado a tu correo')
      setFlujo('codigo')
    } catch { toast.error('Error al solicitar recuperación') }
    finally { setLoading(false) }
  }

  const handleCodigo = async (data) => {
    setLoading(true)
    try {
      await authService.verificarCodigo(correoRec, data.codigo)
      toast.success('Código verificado')
      setFlujo('restablecer')
    } catch { toast.error('Código inválido o expirado') }
    finally { setLoading(false) }
  }

  const handleRestablecer = async (data) => {
    setLoading(true)
    try {
      await authService.restablecerContrasena(correoRec, codigoForm.getValues('codigo'), data.contrasena)
      toast.success('Contraseña actualizada')
      setFlujo('exito')
    } catch { toast.error('Error al restablecer') }
    finally { setLoading(false) }
  }

  /* ── Éxito ── */
  if (flujo === 'exito') return (
    <div className="text-center space-y-6 py-4">
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-[#39A900] flex items-center justify-center shadow-lg shadow-[#39A900]/25">
          <FiCheckCircle size={38} className="text-white" />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900">¡Contraseña actualizada!</h3>
        <p className="text-gray-500 text-sm mt-1.5">Ya puedes iniciar sesión con tu nueva contraseña</p>
      </div>
      <PrimaryBtn onClick={() => { setFlujo('login'); loginForm.reset() }}>
        Iniciar sesión
      </PrimaryBtn>
    </div>
  )

  /* ── Restablecer ── */
  if (flujo === 'restablecer') return (
    <form onSubmit={resetForm.handleSubmit(handleRestablecer)} className="space-y-5">
      <div className="text-center pb-1">
        <FlowIcon icon={FiShield} />
        <h3 className="text-xl font-bold text-gray-900">Nueva contraseña</h3>
        <p className="text-gray-400 text-sm mt-1">Elige una contraseña segura</p>
      </div>
      <PasswordField label="Contraseña nueva" placeholder="••••••••"
        {...resetForm.register('contrasena')} error={resetForm.formState.errors.contrasena?.message} />
      <PasswordField label="Confirmar contraseña" placeholder="••••••••"
        {...resetForm.register('confirmar')} error={resetForm.formState.errors.confirmar?.message} />
      <PrimaryBtn loading={loading} loadingText="Guardando...">Guardar contraseña</PrimaryBtn>
      <BackBtn onClick={() => setFlujo('login')} label="Cancelar" />
    </form>
  )

  /* ── Código ── */
  if (flujo === 'codigo') return (
    <form onSubmit={codigoForm.handleSubmit(handleCodigo)} className="space-y-5">
      <div className="text-center pb-1">
        <FlowIcon icon={FiMail} />
        <h3 className="text-xl font-bold text-gray-900">Revisa tu correo</h3>
        <p className="text-gray-400 text-sm mt-1">
          Enviamos el código a{' '}
          <span className="font-semibold text-gray-600">{correoRec}</span>
        </p>
      </div>
      <Field icon={FiShield} label="Código de verificación" placeholder="000000"
        maxLength="6" inputMode="numeric"
        {...codigoForm.register('codigo')} error={codigoForm.formState.errors.codigo?.message} />
      <PrimaryBtn loading={loading} loadingText="Verificando...">Verificar código</PrimaryBtn>
      <BackBtn onClick={() => setFlujo('correo')} label="Cambiar correo" />
    </form>
  )

  /* ── Recuperar correo ── */
  if (flujo === 'correo') return (
    <form onSubmit={recForm.handleSubmit(handleSolicitar)} className="space-y-5">
      <div className="text-center pb-1">
        <FlowIcon icon={FiMail} />
        <h3 className="text-xl font-bold text-gray-900">Recuperar acceso</h3>
        <p className="text-gray-400 text-sm mt-1">Te enviaremos un código a tu correo</p>
      </div>
      <Field icon={FiMail} label="Correo electrónico" type="email" placeholder="usuario@sena.edu.co"
        {...recForm.register('correo')} error={recForm.formState.errors.correo?.message} />
      <PrimaryBtn loading={loading} loadingText="Enviando...">Enviar código</PrimaryBtn>
      <BackBtn onClick={() => setFlujo('login')} />
    </form>
  )

  /* ══════════════ LOGIN PRINCIPAL ══════════════ */
  return (
    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">

      {/* Encabezado */}
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Bienvenido</h2>
        <p className="text-gray-400 text-sm mt-1">Inicia sesión para continuar</p>
      </div>

      {/* Alerta */}
      {alerta && <AlertaLogin tipo={alerta.tipo} mensaje={alerta.mensaje} />}

      {/* Campos */}
      <Field
        icon={FiMail}
        label="Correo electrónico"
        type="email"
        placeholder="usuario@sena.edu.co"
        {...loginForm.register('correo', { onChange: () => setAlerta(null) })}
        error={loginForm.formState.errors.correo?.message}
      />

      <PasswordField
        label="Contraseña"
        placeholder="••••••••"
        {...loginForm.register('contrasena', { onChange: () => setAlerta(null) })}
        error={loginForm.formState.errors.contrasena?.message}
      />

      {/* ¿Olvidaste? */}
      <div className="flex justify-end -mt-1">
        <button
          type="button"
          onClick={() => setFlujo('correo')}
          className="text-xs font-semibold text-[#39A900] hover:text-[#2d8200] transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {/* Botón */}
      <PrimaryBtn loading={loading} loadingText="Iniciando sesión...">
        Iniciar sesión
      </PrimaryBtn>

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[10px] text-gray-300 font-semibold tracking-widest uppercase">SENA Colombia</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <p className="text-center text-xs text-gray-400">
        Sistema de Gestión de Materiales · Centro de Formación
      </p>
    </form>
  )
}
