import { FiInbox } from 'react-icons/fi'
import { Badge } from '@/components/atoms/Badge/Badge'
import { AccionesFila } from '@/components/molecules/AccionesFila/AccionesFila'

const badgeEstado = (estado) => {
  if (estado === 'DISPONIBLE') return 'success'
  if (estado === 'STOCK BAJO') return 'warning'
  if (estado === 'SIN STOCK')  return 'danger'
  return 'default'
}

const TIPO_LABEL = { item: 'Devolutivo', consumible: 'Consumo' }

const columnas = ['Material', 'Categoría', 'Ubicación', 'Stock', 'Estado', 'Acciones']

export const TablaMateriales = ({
  materiales = [],
  onEditar,
  onHistorial,
  onEliminar,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Cabecera fija */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#39A900]">
              {columnas.map((col) => (
                <th
                  key={col}
                  className="px-5 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      {/* Cuerpo con scroll */}
      <div className="overflow-y-auto overflow-x-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <table className="w-full text-sm">
          <tbody>
            {materiales.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <FiInbox size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-400">No se encontraron materiales</p>
                  <p className="text-xs text-gray-300 mt-1">Intenta ajustar la búsqueda o los filtros</p>
                </td>
              </tr>
            ) : (
              materiales.map((mat, i) => (
                <tr
                  key={mat.id}
                  className={`border-b border-gray-50 hover:bg-[#39A900]/5 transition-colors ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                  }`}
                >
                  <td className="px-5 py-3.5" style={{ width: '30%' }}>
                    <p className="font-semibold text-gray-800 leading-tight">{mat.nombre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 font-mono">{mat.sku}</span>
                      {mat.tipo && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {TIPO_LABEL[mat.tipo] ?? mat.tipo}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-gray-600 text-sm" style={{ width: '20%' }}>{mat.categoria}</td>
                  <td className="px-5 py-3.5 text-gray-600 text-sm" style={{ width: '18%' }}>{mat.ubicacion}</td>

                  <td className="px-5 py-3.5" style={{ width: '12%' }}>
                    <span className={`text-base font-bold ${
                      mat.stockActual === 0               ? 'text-red-500'    :
                      mat.stockActual <= mat.stockMinimo  ? 'text-orange-500' :
                      'text-gray-800'
                    }`}>
                      {mat.stockActual}
                    </span>
                    {mat.tipo === 'item' && mat.stockTotal > 0 && (
                      <span className="text-xs text-gray-400 ml-1">/ {mat.stockTotal}</span>
                    )}
                  </td>

                  <td className="px-5 py-3.5" style={{ width: '12%' }}>
                    <Badge variante={badgeEstado(mat.estado)}>{mat.estado}</Badge>
                  </td>

                  <td className="px-5 py-3.5" style={{ width: '8%' }}>
                    <AccionesFila
                      onEditar={() => onEditar?.(mat)}
                      onHistorial={() => onHistorial?.(mat)}
                      onEliminar={() => onEliminar?.(mat)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pie con total */}
      {materiales.length > 0 && (
        <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{materiales.length}</span> material{materiales.length !== 1 ? 'es' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
