import { FiSearch, FiX } from 'react-icons/fi'

export const SearchBar = ({ placeholder = 'Buscar...', value, onChange }) => {
  return (
    <div className="relative w-full max-w-md">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Limpiar búsqueda"
        >
          <FiX size={15} />
        </button>
      )}
    </div>
  )
}
