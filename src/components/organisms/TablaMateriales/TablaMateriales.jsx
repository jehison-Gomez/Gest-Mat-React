import { FiInbox, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
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
  totalRegistros = 0,
  paginaActual = 1,
  porPagina = 10,
  onAnterior,
  onSiguiente,
  onEditar,
  onHistorial,
  onEliminar,
}) => {
  const inicio      = (paginaActual - 1) * porPagina + 1
  const fin         = Math.min(paginaActual * porPagina, totalRegistros)
  const hayAnterior = paginaActual > 1
  const haySiguiente = fin < totalRegistros
  const totalPaginas = Math.ceil(totalRegistros / porPagina)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Tabla */}
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
                  className={`border-b border-gray-50 hover:bg-[#39A900]/8/40 transition-colors ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                  }`}
                >
                  {/* Material */}
                  <td className="px-5 py-3.5">
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

                  {/* Categoría */}
                  <td className="px-5 py-3.5 text-gray-600 text-sm">{mat.categoria}</td>

                  {/* Ubicación */}
                  <td className="px-5 py-3.5 text-gray-600 text-sm">{mat.ubicacion}</td>

                  {/* Stock */}
                  <td className="px-5 py-3.5">
                    <span className={`text-base font-bold ${
                      mat.stockActual === 0      ? 'text-red-500'    :
                      mat.stockActual <= mat.stockMinimo ? 'text-orange-500' :
                      'text-gray-800'
                    }`}>
                      {mat.stockActual}
                    </span>
                    {mat.tipo === 'item' && mat.stockTotal > 0 && (
                      <span className="text-xs text-gray-400 ml-1">/ {mat.stockTotal}</span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="px-5 py-3.5">
                    <Badge variante={badgeEstado(mat.estado)}>{mat.estado}</Badge>
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-3.5">
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

      {/* Paginación */}
      {totalRegistros > 0 && (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{inicio}–{fin}</span> de{' '}
            <span className="font-semibold text-gray-700">{totalRegistros}</span> materiales
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onAnterior}
              disabled={!hayAnterior}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:border-[#39A900] hover:text-[#39A900] hover:bg-[#39A900]/8 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronLeft size={14} /> Anterior
            </button>

            <span className="text-xs text-gray-400 px-1">
              {paginaActual} / {totalPaginas}
            </span>

            <button
              onClick={onSiguiente}
              disabled={!haySiguiente}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:border-[#39A900] hover:text-[#39A900] hover:bg-[#39A900]/8 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Siguiente <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
