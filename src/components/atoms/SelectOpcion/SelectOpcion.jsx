import { useState, useRef, useEffect } from 'react'
import { FiChevronDown, FiCheck, FiSearch } from 'react-icons/fi'

export const SelectOpcion = ({
  label,
  error,
  placeholder,
  options = [],
  value,
  onChange,
  name,
  searchable = false,
}) => {
  const [abierto, setAbierto] = useState(false)
  const [posicion, setPosicion] = useState('bottom')
  const [busqueda, setBusqueda] = useState('')
  const ref = useRef()
  const triggerRef = useRef()
  const inputRef = useRef()

  const seleccionado = options.find((o) => String(o.value) === String(value))

  const opcionesFiltradas = searchable && busqueda.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(busqueda.toLowerCase()))
    : options

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false)
        setBusqueda('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (abierto && searchable && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
    if (!abierto) setBusqueda('')
  }, [abierto, searchable])

  const handleToggle = () => {
    if (!abierto && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setPosicion(spaceBelow < 250 ? 'top' : 'bottom')
    }
    setAbierto(!abierto)
  }

  const handleSelect = (opt) => {
    onChange?.({ target: { name, value: opt.value } })
    setAbierto(false)
    setBusqueda('')
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
            ? 'border-[#39A900] ring-2 ring-[#39A900]/20'
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
          {/* Campo de búsqueda */}
          {searchable && (
            <div className="px-2 py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-md border border-gray-200">
                <FiSearch size={13} className="text-gray-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar..."
                  className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
          )}

          <ul className="max-h-52 overflow-y-auto py-1">
            {placeholder && !busqueda && (
              <li
                onClick={() => handleSelect({ value: '', label: placeholder })}
                className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors ${
                  !value
                    ? 'bg-[#39A900]/8 text-[#39A900] font-medium'
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                {placeholder}
                {!value && <FiCheck size={14} className="text-[#39A900]" />}
              </li>
            )}
            {opcionesFiltradas.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">
                {busqueda ? `Sin resultados para "${busqueda}"` : 'Sin opciones'}
              </li>
            ) : (
              opcionesFiltradas.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors ${
                    String(value) === String(opt.value)
                      ? 'bg-[#39A900]/8 text-[#39A900] font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                  {String(value) === String(opt.value) && (
                    <FiCheck size={14} className="text-[#39A900]" />
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
