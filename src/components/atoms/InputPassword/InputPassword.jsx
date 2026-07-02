import { forwardRef, useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

export const InputPassword = forwardRef(
  ({ label, error, placeholder, ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={visible ? 'text' : 'password'}
            placeholder={placeholder}
            className={`w-full px-3.5 py-2.5 pr-10 border rounded-lg text-sm transition-all duration-150 focus:outline-none focus:ring-2 placeholder:text-gray-400 ${
              error
                ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                : 'border-gray-200 hover:border-gray-300 focus:border-[#39A900] focus:ring-[#39A900]/15'
            }`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {visible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 flex items-center gap-1"><span>✕</span> {error}</p>}
      </div>
    )
  }
)

InputPassword.displayName = 'InputPassword'
