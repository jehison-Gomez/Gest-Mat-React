import { Link } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'

export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && <FiChevronRight size={14} className="text-gray-400" />}
            {isLast ? (
              <span className="text-gray-800 font-medium">{item.label}</span>
            ) : (
              <Link
                to={item.to}
                className="text-gray-500 hover:text-green-600 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
