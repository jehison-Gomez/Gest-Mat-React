import { FiAlertTriangle } from 'react-icons/fi'
import { Boton } from '@/components/atoms/Boton/Boton'

export const ModalConfirmacion = ({ mensaje, onConfirmar, onCancelar }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancelar}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <FiAlertTriangle className="text-red-600" size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Confirmar eliminación</h3>
            <p className="text-sm text-gray-500 mt-0.5">{mensaje}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Boton variante="secundario" onClick={onCancelar}>
            Cancelar
          </Boton>
          <button
            onClick={onConfirmar}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
