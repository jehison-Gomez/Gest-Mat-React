import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiRepeat } from 'react-icons/fi'
import { Badge } from '@/components/atoms/Badge/Badge'
import { movimientosService } from '@/services/movimientosService'

const badgeTipo = (tipo) => {
  const t = (tipo ?? '').toUpperCase()
  if (t === 'ENTRADA')                       return 'success'
  if (t.startsWith('SALIDA') || t === 'BAJA') return 'danger'
  if (t === 'DEVOLUCION')                    return 'info'
  return 'default'
}

const formatFecha = (fecha) => {
  if (!fecha) return '—'
  const d = new Date(fecha)
  const hoy  = new Date()
  const ayer = new Date(hoy); ayer.setDate(ayer.getDate() - 1)
  const mismo = (a, b) => a.toDateString() === b.toDateString()
  const hora = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  if (mismo(d, hoy))  return `Hoy, ${hora}`
  if (mismo(d, ayer)) return `Ayer, ${hora}`
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short' }) + `, ${hora}`
}

export const TablaMovimientos = () => {
  const navigate = useNavigate()
  const [movimientos, setMovimientos] = useState([])

  useEffect(() => {
    movimientosService.getAll()
      .then((data) => {
        const lista = Array.isArray(data) ? data : (data?.data ?? [])
        setMovimientos(
          lista
            .sort((a, b) => new Date(b.creadoEn ?? b.fecha ?? 0) - new Date(a.creadoEn ?? a.fecha ?? 0))
            .slice(0, 8)
            .map((m) => ({
              material: m.material?.nombre ?? m.materialNombre ?? '—',
              tipo:     m.tipo ?? '—',
              cantidad: m.cantidad ?? 0,
              area:     m.area?.nombre ?? m.usuario?.nombre ?? '—',
              fecha:    m.creadoEn ?? m.fecha,
            }))
        )
      })
      .catch(() => {})
  }, [])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">Últimos Movimientos</h3>
        <button
          onClick={() => navigate('/app/movimientos')}
          className="text-sm text-[#39A900] font-medium hover:text-[#2d8200] transition-colors"
        >
          Ver todos →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#39A900]">
              {['Material', 'Tipo', 'Cantidad', 'Registrado por', 'Fecha'].map((col) => (
                <th key={col} className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movimientos.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-14 text-center">
                  <FiRepeat size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-400">No hay movimientos registrados</p>
                </td>
              </tr>
            ) : (
              movimientos.map((mov, i) => (
                <tr key={i} className={`border-b border-gray-50 hover:bg-[#39A900]/5 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-6 py-3.5 font-semibold text-gray-800">{mov.material}</td>
                  <td className="px-6 py-3.5">
                    <Badge variante={badgeTipo(mov.tipo)}>{mov.tipo}</Badge>
                  </td>
                  <td className={`px-6 py-3.5 font-bold ${Number(mov.cantidad) > 0 ? 'text-[#39A900]' : 'text-red-500'}`}>
                    {Number(mov.cantidad) > 0 ? `+${mov.cantidad}` : mov.cantidad}
                  </td>
                  <td className="px-6 py-3.5 text-gray-500">{mov.area}</td>
                  <td className="px-6 py-3.5 text-gray-400 text-xs">{formatFecha(mov.fecha)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
