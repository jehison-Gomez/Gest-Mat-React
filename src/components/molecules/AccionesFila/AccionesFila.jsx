import { FiEdit2, FiClock, FiTrash2 } from 'react-icons/fi'

export const AccionesFila = ({ onEditar, onHistorial, onEliminar }) => {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onEditar}
        title="Editar"
        className="p-1.5 rounded-md text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
      >
        <FiEdit2 size={15} />
      </button>
      <button
        onClick={onHistorial}
        title="Ver historial"
        className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <FiClock size={15} />
      </button>
      <button
        onClick={onEliminar}
        title="Eliminar"
        className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <FiTrash2 size={15} />
      </button>
    </div>
  )
}
