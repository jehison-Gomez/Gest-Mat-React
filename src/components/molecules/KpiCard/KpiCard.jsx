export const KpiCard = ({ titulo, valor, icono: Icono, color = 'green', subtitulo }) => {
  const paleta = {
    green:  { bg: 'bg-[#39A900]/10', icon: 'text-[#39A900]', dot: 'bg-[#39A900]'  },
    red:    { bg: 'bg-red-50',        icon: 'text-red-500',    dot: 'bg-red-500'    },
    blue:   { bg: 'bg-blue-50',       icon: 'text-blue-500',   dot: 'bg-blue-500'   },
    orange: { bg: 'bg-orange-50',     icon: 'text-orange-500', dot: 'bg-orange-500' },
    purple: { bg: 'bg-purple-50',     icon: 'text-purple-500', dot: 'bg-purple-500' },
    yellow: { bg: 'bg-yellow-50',     icon: 'text-yellow-600', dot: 'bg-yellow-500' },
  }
  const c = paleta[color] ?? paleta.green

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.bg}`}>
          {Icono && <Icono size={20} className={c.icon} />}
        </div>
        <span className={`w-2 h-2 rounded-full mt-1.5 ${c.dot}`} />
      </div>
      <p className="text-3xl font-bold text-gray-900 leading-none tracking-tight">{valor}</p>
      <p className="text-sm font-medium text-gray-500 mt-2">{titulo}</p>
      {subtitulo && (
        <p className="text-xs text-gray-400 mt-0.5">{subtitulo}</p>
      )}
    </div>
  )
}
