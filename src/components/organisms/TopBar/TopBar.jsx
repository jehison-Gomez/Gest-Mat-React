import { FiMenu, FiBell, FiSettings } from 'react-icons/fi'

export const TopBar = ({ onToggleSidebar }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <FiMenu size={20} />
      </button>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors relative">
          <FiBell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <FiSettings size={20} />
        </button>
      </div>
    </header>
  )
}
