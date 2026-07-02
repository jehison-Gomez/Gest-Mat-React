import { forwardRef } from 'react'

export const Textarea = forwardRef(
  ({ label, error, placeholder, rows = 3, ...props }, ref) => {
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
          className={`w-full px-3.5 py-2.5 border rounded-lg text-sm resize-none transition-all duration-150 focus:outline-none focus:ring-2 placeholder:text-gray-400 ${
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
              : 'border-gray-200 hover:border-gray-300 focus:border-[#39A900] focus:ring-[#39A900]/15'
          }`}
          {...props}
        />
        {error && <p className="text-xs text-red-500 flex items-center gap-1"><span>✕</span> {error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
