import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { InputTexto } from '@/components/atoms/InputTexto/InputTexto'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { Textarea } from '@/components/atoms/Textarea/Textarea'
import { Boton } from '@/components/atoms/Boton/Boton'
import { UploadImagen } from '@/components/molecules/UploadImagen/UploadImagen'
import { FiSave } from 'react-icons/fi'

const schemaCrear = z.object({
  tipoIdentificacion: z.string().min(1, 'Selecciona un tipo'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  tipoIdSecundario: z.enum(['codigo_interno', 'placa_sena']),
  codigo: z.string().optional(),
  tipoMaterial: z.string().min(1, 'Selecciona un tipo de material'),
  ubicacion: z.string().min(1, 'Selecciona una ubicación'),
  cantidadInicial: z.coerce.number().min(0, 'Debe ser 0 o mayor'),
  stockMinimo: z.coerce.number().min(0, 'Debe ser 0 o mayor'),
  descripcion: z.string().optional(),
})

const schemaEditar = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  tipoMaterial: z.string().min(1, 'Selecciona un tipo de material'),
  ubicacion: z.string().min(1, 'Selecciona una ubicación'),
  cantidadInicial: z.coerce.number().min(0, 'Debe ser 0 o mayor'),
  stockMinimo: z.coerce.number().min(0, 'Debe ser 0 o mayor'),
  descripcion: z.string().optional(),
})

const TIPOS_ID = [
  { value: 'serial', label: 'Número de Serie' },
  { value: 'lote', label: 'Número de Lote' },
  { value: 'interno', label: 'Código Interno' },
]

export const FormularioMaterial = ({
  modo = 'crear',
  valoresIniciales = {},
  tiposMaterial = [],
  ubicaciones = [],
  onGuardar,
  onCancelar,
  cargando = false,
}) => {
  const esEditar = modo === 'editar'

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(esEditar ? schemaEditar : schemaCrear),
    defaultValues: {
      tipoIdSecundario: 'codigo_interno',
      cantidadInicial: 0,
      stockMinimo: 0,
    },
  })

  useEffect(() => {
    if (esEditar && Object.keys(valoresIniciales).length > 0) {
      reset(valoresIniciales)
    }
  }, [valoresIniciales, esEditar, reset])

  return (
    <form onSubmit={handleSubmit(onGuardar)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

        {/* Campos solo en modo CREAR */}
        {!esEditar && (
          <>
            <Controller
              name="tipoIdentificacion"
              control={control}
              render={({ field }) => (
                <SelectOpcion
                  label="Tipo de Identificación *"
                  placeholder="Seleccione un tipo"
                  options={TIPOS_ID}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  name={field.name}
                  error={errors.tipoIdentificacion?.message}
                />
              )}
            />

            <InputTexto
              label="Nombre del Material *"
              placeholder="Ej: Martillo"
              {...register('nombre')}
              error={errors.nombre?.message}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Tipo de Identificación
              </label>
              <div className="flex gap-6 mt-1">
                {[
                  { value: 'codigo_interno', label: 'Código Interno' },
                  { value: 'placa_sena', label: 'Placa Sena' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={opt.value}
                      {...register('tipoIdSecundario')}
                      className="accent-green-600"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <InputTexto
              label="Código / Identificación"
              placeholder="Ingresa el código"
              {...register('codigo')}
              error={errors.codigo?.message}
            />
          </>
        )}

        {/* Campos en modo EDITAR */}
        {esEditar && (
          <InputTexto
            label="Nombre del Material *"
            placeholder="Ej: Martillo Demoledor"
            {...register('nombre')}
            error={errors.nombre?.message}
          />
        )}

        <Controller
          name="tipoMaterial"
          control={control}
          render={({ field }) => (
            <SelectOpcion
              label="Tipo de Material *"
              placeholder="Seleccione un tipo"
              options={tiposMaterial}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              name={field.name}
              error={errors.tipoMaterial?.message}
            />
          )}
        />

        <Controller
          name="ubicacion"
          control={control}
          render={({ field }) => (
            <SelectOpcion
              label="Ubicación / Área *"
              placeholder="Asignar área"
              options={ubicaciones}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              name={field.name}
              error={errors.ubicacion?.message}
            />
          )}
        />

        <InputTexto
          label="Cantidad Inicial *"
          type="number"
          min="0"
          {...register('cantidadInicial')}
          error={errors.cantidadInicial?.message}
        />

        <div className="space-y-1.5">
          <InputTexto
            label="Stock Mínimo (Alerta)"
            type="number"
            min="0"
            {...register('stockMinimo')}
            error={errors.stockMinimo?.message}
          />
          <p className="text-xs text-gray-400">
            El sistema notificará cuando el stock baje de este valor.
          </p>
        </div>
      </div>

      <Textarea
        label="Descripción Detallada"
        placeholder="Añadir especificaciones técnicas, marca, modelo o cualquier detalle relevante..."
        rows={4}
        {...register('descripcion')}
        error={errors.descripcion?.message}
      />

      {/* Upload solo en modo CREAR */}
      {!esEditar && (
        <Controller
          name="imagen"
          control={control}
          render={({ field }) => (
            <UploadImagen
              onChange={field.onChange}
              error={errors.imagen?.message}
            />
          )}
        />
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t border-gray-100">
        <Boton type="button" variante="secundario" onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton
          type="submit"
          variante="primario"
          disabled={cargando}
          className="flex items-center justify-center gap-2"
        >
          <FiSave size={15} />
          {cargando ? 'Guardando...' : esEditar ? 'Guardar' : 'Guardar Material'}
        </Boton>
      </div>
    </form>
  )
}
