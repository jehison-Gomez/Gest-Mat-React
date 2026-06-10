import { useEffect, useState } from 'react'
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi'

const iconMap = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
  warning: FiAlertCircle,
}

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
}

const iconColorMap = {
  success: 'text-green-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-yellow-600',
}

export const Toast = ({ id, type = 'info', message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)
  const Icon = iconMap[type] || iconMap.info

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose(id), 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, id, onClose])

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`border rounded-lg p-4 shadow-lg flex items-start gap-3 ${colorMap[type]}`}>
        <Icon className={`flex-shrink-0 w-5 h-5 mt-0.5 ${iconColorMap[type]}`} />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose(id), 300)
          }}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
