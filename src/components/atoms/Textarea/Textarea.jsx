import { forwardRef } from 'react'

export const Textarea = forwardRef(
  ({ label, error, placeholder, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-gray-200 focus:border-green-500 focus:ring-green-500'
          }`}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
