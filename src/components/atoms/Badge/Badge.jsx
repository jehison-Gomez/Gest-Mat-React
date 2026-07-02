export const Badge = ({ children, variante = 'default' }) => {
  const variantes = {
    success: 'bg-[#39A900]/8 text-[#39A900] ring-1 ring-[#39A900]/20',
    danger:  'bg-red-50 text-red-600 ring-1 ring-red-200',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    info:    'bg-blue-50 text-blue-600 ring-1 ring-blue-200',
    default: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
    purple:  'bg-purple-50 text-purple-600 ring-1 ring-purple-200',
    orange:  'bg-orange-50 text-orange-600 ring-1 ring-orange-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantes[variante]}`}>
      {children}
    </span>
  )
}
