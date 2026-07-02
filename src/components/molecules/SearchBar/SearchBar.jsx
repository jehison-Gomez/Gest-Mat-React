import { FiSearch, FiX } from 'react-icons/fi'

export const SearchBar = ({ placeholder = 'Buscar...', value, onChange }) => {
  return (
    <div className="relative w-full max-w-md">
      <FiSearch
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        size={15}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#39A900]/15 focus:border-[#39A900] hover:border-gray-300 placeholder:text-gray-400"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
          title="Limpiar"
        >
          <FiX size={15} />
        </button>
      )}
    </div>
  )
}
