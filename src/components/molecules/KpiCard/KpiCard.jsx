export const KpiCard = ({ titulo, valor, icono: Icono, color = 'green' }) => {
  const colores = {
    green:  'bg-green-100 text-green-700',
    red:    'bg-red-100 text-red-700',
    blue:   'bg-blue-100 text-blue-700',
    orange: 'bg-orange-100 text-orange-700',
    purple: 'bg-purple-100 text-purple-700',
    yellow: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colores[color]}`}>
        <Icono size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{titulo}</p>
        <p className="text-2xl font-bold text-gray-900">{valor}</p>
      </div>
    </div>
  )
}
