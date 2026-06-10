import { createContext, useCallback, useState } from 'react'

export const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const value = {
    toasts,
    addToast,
    removeToast,
  }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
