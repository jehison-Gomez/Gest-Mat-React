import { FiEdit2, FiClock, FiTrash2 } from 'react-icons/fi'

export const AccionesFila = ({ onEditar, onHistorial, onEliminar }) => {
  return (
    <div className="flex items-center gap-1">
      {onEditar && (
        <button
          onClick={onEditar}
          title="Editar"
          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
        >
          <FiEdit2 size={14} />
        </button>
      )}
      {onHistorial && (
        <button
          onClick={onHistorial}
          title="Ver historial"
          className="p-2 rounded-lg text-gray-400 hover:text-[#39A900] hover:bg-green-50 transition-all"
        >
          <FiClock size={14} />
        </button>
      )}
      {onEliminar && (
        <button
          onClick={onEliminar}
          title="Eliminar"
          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <FiTrash2 size={14} />
        </button>
      )}
    </div>
  )
}
