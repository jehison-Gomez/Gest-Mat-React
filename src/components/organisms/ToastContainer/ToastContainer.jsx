import { useContext } from 'react'
import { ToastContext } from '@/context/ToastContext'
import { Toast } from '@/components/atoms/Toast/Toast'

export const ToastContainer = () => {
  const { toasts, removeToast } = useContext(ToastContext)

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}
