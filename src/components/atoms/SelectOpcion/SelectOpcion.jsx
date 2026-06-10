import { useState, useRef, useEffect } from 'react'
import { FiChevronDown, FiCheck } from 'react-icons/fi'

export const SelectOpcion = ({
  label,
  error,
  placeholder,
  options = [],
  value,
  onChange,
  name,
}) => {
  const [abierto, setAbierto] = useState(false)
  const [posicion, setPosicion] = useState('bottom')
  const ref = useRef()
  const triggerRef = useRef()

  const seleccionado = options.find((o) => String(o.value) === String(value))

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    if (!abierto && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setPosicion(spaceBelow < 200 ? 'top' : 'bottom')
    }
    setAbierto(!abierto)
  }

  const handleSelect = (opt) => {
    onChange?.({ target: { name, value: opt.value } })
    setAbierto(false)
  }

  return (
    <div className="w-full space-y-1.5 relative" ref={ref}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        ref={triggerRef}
        onClick={handleToggle}
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          abierto
            ? 'border-green-500 ring-2 ring-green-500 ring-offset-1'
            : error
            ? 'border-red-400'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className={seleccionado ? 'text-gray-800' : 'text-gray-400'}>
          {seleccionado ? seleccionado.label : placeholder || 'Selecciona...'}
        </span>
        <FiChevronDown
          size={15}
          className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${abierto ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {abierto && (
        <div
          className={`absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden ${
            posicion === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          style={{ minWidth: triggerRef.current?.offsetWidth }}
        >
          <ul className="max-h-52 overflow-y-auto py-1">
            {placeholder && (
              <li
                onClick={() => handleSelect({ value: '', label: placeholder })}
                className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors ${
                  !value
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                {placeholder}
                {!value && <FiCheck size={14} className="text-green-600" />}
              </li>
            )}
            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">Sin opciones</li>
            ) : (
              options.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors ${
                    String(value) === String(opt.value)
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                  {String(value) === String(opt.value) && (
                    <FiCheck size={14} className="text-green-600" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
