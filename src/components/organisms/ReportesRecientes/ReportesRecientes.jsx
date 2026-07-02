import { FiDownload, FiFileText } from 'react-icons/fi'

const iconoTipo = (tipo) =>
  tipo === 'PDF'
    ? <FiFileText size={16} className="text-red-600 flex-shrink-0" />
    : <FiFileText size={16} className="text-green-600 flex-shrink-0" />

export const ReportesRecientes = ({ reportes = [] }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <h3 className="text-base font-semibold text-gray-900">Reportes Recientes</h3>

      {reportes.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Sin reportes recientes</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {reportes.map((r, i) => (
            <li key={i} className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
              <div className="flex items-start gap-2">
                {iconoTipo(r.tipo)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.nombre}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.tipo} • {r.fecha}</p>
                </div>
              </div>
              <button
                onClick={r.onDescargar}
                className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
                title="Descargar"
              >
                <FiDownload size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
