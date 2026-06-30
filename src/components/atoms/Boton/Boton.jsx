import { forwardRef } from 'react'

export const Boton = forwardRef(
  (
    {
      children,
      variante = 'primario',
      tamanio = 'md',
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const variantes = {
      primario:
        'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400',
      secundario:
        'border border-gray-300 hover:bg-gray-50 text-gray-700 disabled:text-gray-400 disabled:border-gray-200',
      texto:
        'text-green-600 hover:text-green-700 underline disabled:text-gray-400',
      azul:
        'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400',
      peligro:
        'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400',
    }

    const tamanios = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`rounded-md transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:cursor-not-allowed ${variantes[variante]} ${tamanios[tamanio]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Boton.displayName = 'Boton'
