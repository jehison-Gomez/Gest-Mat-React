import { forwardRef } from 'react'

export const Boton = forwardRef(
  ({ children, variante = 'primario', tamanio = 'md', disabled = false, className = '', ...props }, ref) => {
    const variantes = {
      primario:
        'bg-[#39A900] hover:bg-[#2d8200] active:bg-[#1e5a00] text-white shadow-sm disabled:bg-gray-300 disabled:shadow-none',
      secundario:
        'bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 disabled:text-gray-400',
      texto:
        'text-[#39A900] hover:text-[#2d8200] hover:bg-[#39A900]/8 disabled:text-gray-400',
      azul:
        'bg-blue-600 hover:bg-blue-500 text-white shadow-sm disabled:bg-gray-300',
      peligro:
        'bg-red-600 hover:bg-red-500 text-white shadow-sm disabled:bg-gray-300',
    }
    const tamanios = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-sm gap-2',
    }
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39A900]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${variantes[variante]} ${tamanios[tamanio]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Boton.displayName = 'Boton'
