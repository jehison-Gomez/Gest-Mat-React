import { FiAlertTriangle, FiCheck } from 'react-icons/fi'
import { Boton } from '@/components/atoms/Boton/Boton'

const VARIANTES = {
  peligro: {
    icono:      FiAlertTriangle,
    iconoFondo: 'bg-red-50',
    iconoColor: 'text-red-500',
    boton:      'bg-red-600 hover:bg-red-700 active:bg-red-800',
    strip:      'bg-red-500',
  },
  exito: {
    icono:      FiCheck,
    iconoFondo: 'bg-green-50',
    iconoColor: 'text-[#39A900]',
    boton:      'bg-[#39A900] hover:bg-[#2d8200] active:bg-[#1e5a00]',
    strip:      'bg-[#39A900]',
  },
}

export const ModalConfirmacion = ({
  titulo = 'Confirmar eliminación',
  mensaje,
  textoConfirmar = 'Eliminar',
  variante = 'peligro',
  onConfirmar,
  onCancelar,
}) => {
  const cfg = VARIANTES[variante] ?? VARIANTES.peligro
  const Icono = cfg.icono

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancelar}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden anim-scale-in">
        {/* Franja superior */}
        <div className={`h-1 ${cfg.strip}`} />

        <div className="p-6 space-y-4">
          {/* Icono + texto */}
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconoFondo}`}>
              <Icono className={cfg.iconoColor} size={22} />
            </div>
            <div className="pt-0.5">
              <h3 className="text-base font-semibold text-gray-900">{titulo}</h3>
              {mensaje && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{mensaje}</p>}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-1">
            <Boton variante="secundario" onClick={onCancelar}>
              Cancelar
            </Boton>
            <button
              onClick={onConfirmar}
              className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all shadow-sm ${cfg.boton}`}
            >
              {textoConfirmar}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
