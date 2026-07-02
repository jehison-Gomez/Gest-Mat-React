import { useContext } from 'react'
import { ToastContext } from '@/context/ToastContext'

export const useToast = () => {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast debe ser usado dentro de ToastProvider')
  }

  return {
    success: (message, duration) => context.addToast(message, 'success', duration),
    error: (message, duration) => context.addToast(message, 'error', duration),
    info: (message, duration) => context.addToast(message, 'info', duration),
    warning: (message, duration) => context.addToast(message, 'warning', duration),
  }
}
