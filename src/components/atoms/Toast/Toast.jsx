import { useEffect, useState } from 'react'
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi'

const config = {
  success: {
    icon:   FiCheckCircle,
    strip:  'bg-[#39A900]',
    icon_c: 'text-[#39A900]',
    label:  'Éxito',
  },
  error: {
    icon:   FiAlertCircle,
    strip:  'bg-red-500',
    icon_c: 'text-red-500',
    label:  'Error',
  },
  warning: {
    icon:   FiAlertTriangle,
    strip:  'bg-amber-500',
    icon_c: 'text-amber-500',
    label:  'Aviso',
  },
  info: {
    icon:   FiInfo,
    strip:  'bg-blue-500',
    icon_c: 'text-blue-500',
    label:  'Info',
  },
}

export const Toast = ({ id, type = 'info', message, duration = 4500, onClose }) => {
  const [leaving, setLeaving] = useState(false)
  const cfg = config[type] ?? config.info
  const Icon = cfg.icon

  const dismiss = () => {
    setLeaving(true)
    setTimeout(() => onClose(id), 220)
  }

  useEffect(() => {
    if (!duration) return
    const t = setTimeout(dismiss, duration)
    return () => clearTimeout(t)
  }, [duration, id])

  return (
    <div className={leaving ? 'anim-slide-out' : 'anim-slide-in'}>
      <div className="flex items-stretch bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-[340px] max-w-[90vw]">
        {/* Franja de color lateral */}
        <div className={`w-1 flex-shrink-0 ${cfg.strip}`} />

        {/* Contenido */}
        <div className="flex items-start gap-3 px-4 py-3.5 flex-1 min-w-0">
          <Icon size={18} className={`flex-shrink-0 mt-0.5 ${cfg.icon_c}`} />
          <p className="flex-1 text-sm text-gray-700 font-medium leading-snug break-words">{message}</p>
          <button
            onClick={dismiss}
            className="flex-shrink-0 p-0.5 text-gray-300 hover:text-gray-500 transition-colors rounded-md ml-1"
          >
            <FiX size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
