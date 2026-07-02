import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { InputTexto } from '@/components/atoms/InputTexto/InputTexto'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { Textarea } from '@/components/atoms/Textarea/Textarea'
import { Boton } from '@/components/atoms/Boton/Boton'
import { Toggle } from '@/components/atoms/Toggle/Toggle'
import { FiSave } from 'react-icons/fi'

const schemaConSede = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  sede: z.string().min(1, 'Selecciona una sede'),
  encargado: z.string().optional(),
  activa: z.boolean(),
})

const schemaSinSede = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  sede: z.string().optional(),
  encargado: z.string().optional(),
  activa: z.boolean(),
})

const SeccionFormulario = ({ titulo, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
    <h3 className="text-base font-semibold text-gray-800">{titulo}</h3>
    {children}
  </div>
)

export const FormularioArea = ({
  modo = 'crear',
  valoresIniciales = {},
  sedes = [],
  sedeFija = null,
  usuarios = [],
  onGuardar,
  onCancelar,
  cargando = false,
}) => {
  const mostrarSedeSelectorr = !sedeFija
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(mostrarSedeSelectorr ? schemaConSede : schemaSinSede),
    defaultValues: { activa: true },
  })

  useEffect(() => {
    if (modo === 'editar' && Object.keys(valoresIniciales).length > 0) {
      reset(valoresIniciales)
    }
  }, [valoresIniciales, modo, reset])

  return (
    <form onSubmit={handleSubmit(onGuardar)} className="space-y-5">

      {/* Sección A: Información General */}
      <SeccionFormulario titulo="Información General">
        <InputTexto
          label="Nombre del Área *"
          placeholder="Ej: Laboratorio de Sistemas 2"
          {...register('nombre')}
          error={errors.nombre?.message}
        />
        <Textarea
          label="Descripción *"
          placeholder="Describe el propósito y características del área..."
          rows={3}
          {...register('descripcion')}
          error={errors.descripcion?.message}
        />
      </SeccionFormulario>

      {/* Sección B: Ubicación */}
      {mostrarSedeSelectorr ? (
        <SeccionFormulario titulo="Ubicación">
          <Controller
            name="sede"
            control={control}
            render={({ field }) => (
              <SelectOpcion
                label="Sede *"
                placeholder="Selecciona una sede"
                options={sedes}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                name={field.name}
                error={errors.sede?.message}
              />
            )}
          />
        </SeccionFormulario>
      ) : (
        <SeccionFormulario titulo="Ubicación">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
            <span className="text-sm text-[#39A900] font-medium">Sede:</span>
            <span className="text-sm text-green-900">{sedes.find(s => s.value === sedeFija)?.label ?? 'Tu sede asignada'}</span>
          </div>
        </SeccionFormulario>
      )}

      {/* Sección C: Asignación y Estado */}
      <SeccionFormulario titulo="Asignación y Estado">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 items-start">
          <Controller
            name="encargado"
            control={control}
            render={({ field }) => (
              <SelectOpcion
                label="Encargado del Área *"
                placeholder="Selecciona un usuario"
                options={usuarios}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                name={field.name}
                error={errors.encargado?.message}
              />
            )}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Estado del Área
            </label>
            <Controller
              name="activa"
              control={control}
              render={({ field }) => (
                <Toggle
                  label="Área Activa"
                  descripcion="Las áreas inactivas no podrán recibir nuevos materiales."
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      </SeccionFormulario>

      {/* Botones */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <Boton type="button" variante="secundario" onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton
          type="submit"
          variante="azul"
          disabled={cargando}
          className="flex items-center justify-center gap-2"
        >
          <FiSave size={15} />
          {cargando ? 'Guardando...' : modo === 'editar' ? 'Guardar' : 'Guardar Área'}
        </Boton>
      </div>
    </form>
  )
}
