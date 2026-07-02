import { FiEye, FiFileText } from 'react-icons/fi'
import { Badge } from '@/components/atoms/Badge/Badge'

const badgeEstado = (stock, minimo) => {
  if (stock === 0) return { variante: 'danger', label: 'Sin Stock' }
  if (stock <= minimo) return { variante: 'warning', label: 'Stock Bajo' }
  return { variante: 'success', label: 'Normal' }
}

export const VistaPreviewReporte = ({ datos = [], meta = {}, onExportarPDF, onExportarExcel }) => {
  const totalItems = datos.reduce((acc, d) => acc + (d.stock ?? 0), 0)
  const stockBajo = datos.filter((d) => d.stock <= d.minimo).length

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <FiEye size={18} className="text-[#39A900]" />
          <h3 className="text-base font-semibold text-gray-900">Vista Previa del Reporte</h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onExportarPDF}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <FiFileText size={15} />
            Exportar PDF
          </button>
          <button
            onClick={onExportarExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-green-500 hover:bg-[#39A900] rounded-lg transition-colors"
          >
            <FiFileText size={15} />
            Exportar Excel
          </button>
        </div>
      </div>

      {datos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-3">
          <FiEye size={40} className="text-gray-300" />
          <p className="text-sm">Configura los parámetros y haz clic en "Generar Vista Previa"</p>
        </div>
      ) : (
        <>
          {/* Encabezado del reporte */}
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-bold text-gray-900">{meta.titulo ?? 'Reporte de Inventario Actual'}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Generado el: {meta.fecha ?? new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-xs text-gray-500">
                  Área: {meta.area ?? 'Todas las áreas'} | Categoría: {meta.categoria ?? 'Todos'}
                </p>
              </div>
              <div className="text-[#39A900] font-bold text-sm">Gest Mat</div>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Items</p>
              <p className="text-3xl font-bold text-gray-900">{totalItems.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Stock Bajo</p>
              <p className="text-3xl font-bold text-red-600">{stockBajo}</p>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {['Código', 'Descripción', 'Categoría', 'Stock', 'Mínimo', 'Estado'].map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {datos.map((fila, i) => {
                  const estado = badgeEstado(fila.stock, fila.minimo)
                  return (
                    <tr key={i} className="hover:bg-[#39A900]/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{fila.codigo}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{fila.descripcion}</td>
                      <td className="px-4 py-3 text-gray-600">{fila.categoria}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{fila.stock}</td>
                      <td className="px-4 py-3 text-gray-600">{fila.minimo}</td>
                      <td className="px-4 py-3">
                        <Badge variante={estado.variante}>{estado.label}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-400 text-center">
            Página 1 de {Math.ceil(datos.length / 10)} · Documento generado automáticamente por Gest Mat. Confidencial.
          </p>
        </>
      )}
    </div>
  )
}
