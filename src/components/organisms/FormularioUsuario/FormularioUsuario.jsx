import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiUser, FiMail, FiPhone, FiLock, FiShield, FiCreditCard, FiBriefcase } from 'react-icons/fi'
import { InputIcono } from '@/components/atoms/InputIcono/InputIcono'
import { InputPassword } from '@/components/atoms/InputPassword/InputPassword'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { Toggle } from '@/components/atoms/Toggle/Toggle'
import { Boton } from '@/components/atoms/Boton/Boton'

const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
  { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
  { value: 'CE', label: 'Cédula de Extranjería (CE)' },
  { value: 'PP', label: 'Pasaporte (PP)' },
]

const schemaCrear = z.object({
  rol: z.string().min(1, 'Selecciona un rol'),
  sedeId: z.string().optional(),
  activo: z.boolean(),
  nombres: z.string().min(1, 'Los nombres son requeridos'),
  apellidos: z.string().optional().default(''),
  correo: z.string().email('Email inválido').min(1, 'El correo es requerido'),
  telefono: z.string().min(1, 'El teléfono es requerido'),
  tipoDocumento: z.string().min(1, 'Selecciona el tipo de documento'),
  numeroDocumento: z.string().min(1, 'El número de documento es requerido'),
  contrasena: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmar: z.string().min(1, 'Confirma la contraseña'),
}).refine((d) => d.contrasena === d.confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar'],
})

const schemaEditar = z.object({
  rol: z.string().min(1, 'Selecciona un rol'),
  sedeId: z.string().optional(),
  activo: z.boolean(),
  nombres: z.string().min(1, 'Los nombres son requeridos'),
  apellidos: z.string().optional().default(''),
  correo: z.string().email('Email inválido').min(1, 'El correo es requerido'),
  telefono: z.string().min(1, 'El teléfono es requerido'),
  tipoDocumento: z.string().optional(),
  numeroDocumento: z.string().min(1, 'El número de documento es requerido'),
  contrasena: z.string().min(8, 'Mínimo 8 caracteres').optional().or(z.literal('')),
  confirmar: z.string().optional(),
}).refine((d) => !d.contrasena || d.contrasena === d.confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar'],
})

const SeccionCard = ({ icono: Icono, titulo, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
    <div className="flex items-center gap-2">
      {Icono && <Icono size={18} className="text-[#39A900]" />}
      <h3 className="text-base font-semibold text-gray-900">{titulo}</h3>
    </div>
    {children}
  </div>
)

export const FormularioUsuario = ({
  modo = 'crear',
  valoresIniciales = {},
  roles = [],
  sedes = [],
  onGuardar,
  onCancelar,
  onRolChange,
  cargando = false,
}) => {
  const esEditar = modo === 'editar'

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(esEditar ? schemaEditar : schemaCrear),
    defaultValues: { activo: true },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    if (esEditar && Object.keys(valoresIniciales).length > 0) {
      reset(valoresIniciales)
    }
  }, [valoresIniciales, esEditar, reset])

  return (
    <form onSubmit={handleSubmit(onGuardar)} className="space-y-5">

      {/* Sección 1: Roles y Permisos */}
      <SeccionCard icono={FiShield} titulo="Roles y Permisos">
        <Controller
          name="rol"
          control={control}
          render={({ field }) => (
            <SelectOpcion
              label="Rol en el Sistema *"
              placeholder="Selecciona un rol"
              options={roles}
              value={field.value}
              onChange={(e) => { field.onChange(e.target.value); onRolChange?.(e.target.value) }}
              name={field.name}
              error={errors.rol?.message}
            />
          )}
        />
        <p className="text-xs text-gray-500 -mt-3">
          El rol determinará los permisos de acceso y edición.
        </p>

        {/* Sede asignada — visible solo cuando hay sedes disponibles */}
        {sedes.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <FiBriefcase size={15} className="text-[#39A900]" />
              <label className="block text-sm font-medium text-gray-800">
                Sede Asignada
              </label>
            </div>
            <select
              {...register('sedeId')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Sin sede (Super Admin / sin restricción)</option>
              {sedes.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400">
              El administrador solo podrá ver datos de la sede seleccionada.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-800">
            Estado de la Cuenta
          </label>
          <Controller
            name="activo"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Usuario Activo"
                descripcion="Si desactivas la cuenta, el usuario no podrá ingresar al sistema."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </SeccionCard>

      {/* Sección 2: Información Personal */}
      <SeccionCard icono={FiUser} titulo="Información Personal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <InputIcono
            label="Nombres"
            requerido
            placeholder="Juan Carlos"
            icono={FiUser}
            {...register('nombres')}
            error={errors.nombres?.message}
          />
          <InputIcono
            label="Apellidos"
            requerido
            placeholder="Pérez Gómez"
            icono={FiUser}
            {...register('apellidos')}
            error={errors.apellidos?.message}
          />
          <InputIcono
            label="Correo Electrónico"
            requerido
            type="email"
            placeholder="correo@sena.edu.co"
            icono={FiMail}
            {...register('correo')}
            error={errors.correo?.message}
          />
          <InputIcono
            label="Teléfono / Celular"
            requerido
            type="tel"
            placeholder="+57 300 000 0000"
            icono={FiPhone}
            {...register('telefono')}
            error={errors.telefono?.message}
          />
          <Controller
            name="tipoDocumento"
            control={control}
            render={({ field }) => (
              <SelectOpcion
                label={`Tipo de Documento${!esEditar ? ' *' : ''}`}
                placeholder="Selecciona el tipo"
                options={TIPOS_DOCUMENTO}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
                name={field.name}
                error={errors.tipoDocumento?.message}
              />
            )}
          />
          <InputIcono
            label="Número de Documento"
            requerido
            placeholder="1234567890"
            icono={FiCreditCard}
            {...register('numeroDocumento')}
            error={errors.numeroDocumento?.message}
          />
        </div>
      </SeccionCard>

      {/* Sección 3: Seguridad */}
      <SeccionCard icono={FiLock} titulo="Seguridad">
        {esEditar && (
          <p className="text-xs text-gray-500">
            Deja los campos en blanco si no deseas cambiar la contraseña.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <InputPassword
            label={`Contraseña${!esEditar ? ' *' : ''}`}
            placeholder="••••••••"
            {...register('contrasena')}
            error={errors.contrasena?.message}
          />
          <InputPassword
            label={`Confirmar Contraseña${!esEditar ? ' *' : ''}`}
            placeholder="••••••••"
            {...register('confirmar')}
            error={errors.confirmar?.message}
          />
        </div>
      </SeccionCard>

      {/* Botones */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <Boton type="button" variante="secundario" onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton
          type="submit"
          variante="primario"
          disabled={cargando}
          className="flex items-center justify-center gap-2"
        >
          {cargando ? 'Guardando...' : esEditar ? 'Guardar' : 'Guardar Usuario'}
        </Boton>
      </div>
    </form>
  )
}
