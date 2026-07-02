import { Badge } from '@/components/atoms/Badge/Badge'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'

const columnas = ['Nombre del Área', 'Descripción', 'Sede', 'Encargado', 'Estado', 'Acciones']

export const TablaAreas = ({
  areas = [],
  totalRegistros = 0,
  paginaActual = 1,
  porPagina = 10,
  onAnterior,
  onSiguiente,
  onEditar,
  onEliminar,
}) => {
  const inicio = (paginaActual - 1) * porPagina + 1
  const fin = Math.min(paginaActual * porPagina, totalRegistros)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#39A900]">
              {columnas.map((col) => (
                <th key={col} className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {areas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">
                  No se encontraron áreas
                </td>
              </tr>
            ) : (
              areas.map((area) => (
                <tr key={area.id} className="hover:bg-[#39A900]/5 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-800">{area.nombre}</td>
                  <td className="px-5 py-4 text-gray-600 max-w-xs truncate">{area.descripcion}</td>
                  <td className="px-5 py-4 text-gray-600">{area.sede}</td>
                  <td className="px-5 py-4 text-gray-600">{area.encargado}</td>
                  <td className="px-5 py-4">
                    <Badge variante={area.estado === 'Activo' ? 'success' : 'default'}>
                      {area.estado}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditar?.(area)}
                        title="Editar"
                        className="p-1.5 rounded-md text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        onClick={() => onEliminar?.(area)}
                        title="Eliminar"
                        className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          {totalRegistros > 0
            ? `Mostrando ${inicio} a ${fin} de ${totalRegistros} áreas`
            : 'Sin resultados'}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onAnterior}
            disabled={paginaActual <= 1}
            className="px-4 py-1.5 text-sm rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={onSiguiente}
            disabled={fin >= totalRegistros}
            className="px-4 py-1.5 text-sm rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}
