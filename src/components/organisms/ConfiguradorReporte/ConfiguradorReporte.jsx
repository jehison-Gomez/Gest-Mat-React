import { Controller } from 'react-hook-form'
import { FiEye, FiCalendar, FiSettings } from 'react-icons/fi'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { Boton } from '@/components/atoms/Boton/Boton'

const TIPOS_REPORTE = [
  { value: 'inventario', label: 'Inventario Actual' },
  { value: 'movimientos', label: 'Movimientos' },
  { value: 'stock_critico', label: 'Stock Crítico' },
  { value: 'prestamos', label: 'Préstamos' },
]

export const ConfiguradorReporte = ({ control, register, areas = [], categorias = [], onGenerar, cargando }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      {/* Encabezado */}
      <div className="flex items-center gap-2">
        <FiSettings size={18} className="text-[#39A900]" />
        <h3 className="text-base font-semibold text-gray-900">Configurar Reporte</h3>
      </div>

      {/* Tipo de reporte */}
      <Controller
        name="tipo"
        control={control}
        render={({ field }) => (
          <SelectOpcion
            label="Tipo de Reporte"
            options={TIPOS_REPORTE}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            name={field.name}
          />
        )}
      />

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-800">Fecha Inicio</label>
          <div className="relative">
            <FiCalendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              {...register('fechaInicio')}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-800">Fecha Fin</label>
          <div className="relative">
            <FiCalendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              {...register('fechaFin')}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Área */}
      <Controller
        name="area"
        control={control}
        render={({ field }) => (
          <SelectOpcion
            label="Área / Sede"
            placeholder="Todas las áreas"
            options={areas}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            name={field.name}
          />
        )}
      />

      {/* Categoría */}
      <Controller
        name="categoria"
        control={control}
        render={({ field }) => (
          <SelectOpcion
            label="Categoría"
            placeholder="Todas las categorias"
            options={categorias}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            name={field.name}
          />
        )}
      />

      <Boton
        type="button"
        variante="primario"
        onClick={onGenerar}
        disabled={cargando}
        className="w-full flex items-center justify-center gap-2"
      >
        <FiEye size={16} />
        {cargando ? 'Generando...' : 'Generar Vista Previa'}
      </Boton>
    </div>
  )
}
