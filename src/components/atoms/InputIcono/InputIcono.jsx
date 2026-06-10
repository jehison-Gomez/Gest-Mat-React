import { forwardRef } from 'react'

export const InputIcono = forwardRef(
  ({ label, error, placeholder, type = 'text', icono: Icono, helpText, requerido, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-800">
            {label}
            {requerido && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {Icono && (
            <Icono
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          )}
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            className={`w-full py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              Icono ? 'pl-9 pr-4' : 'px-4'
            } ${
              error
                ? 'border-red-400 bg-red-50 focus:ring-red-400'
                : 'border-gray-300 focus:border-green-600 focus:ring-green-600'
            }`}
            {...props}
          />
        </div>
        {helpText && !error && (
          <p className="text-xs text-gray-500">{helpText}</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

InputIcono.displayName = 'InputIcono'
