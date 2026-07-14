import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { KpiCard } from '@/components/molecules/KpiCard/KpiCard'
import { GraficosSection } from '@/components/organisms/GraficosSection/GraficosSection'
import { TablaMovimientos } from '@/components/organisms/TablaMovimientos/TablaMovimientos'
import { FiPackage, FiAlertTriangle, FiRepeat, FiClipboard, FiClock } from 'react-icons/fi'
import { materialesService } from '@/services/materialesService'
import { movimientosService } from '@/services/movimientosService'
import { prestamosService } from '@/services/prestamosService'
import { useAuth } from '@/hooks/useAuth'
import { normalizeList } from '@/utils/normalizeList'

const saludo = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const primerNombre = user?.nombre?.split(' ')[0] ?? ''

  const [kpis, setKpis] = useState([
    { titulo: 'Total Materiales',     valor: '—', icono: FiPackage,      color: 'green'  },
    { titulo: 'Stock Bajo',           valor: '—', icono: FiAlertTriangle, color: 'red'    },
    { titulo: 'Movimientos Hoy',      valor: '—', icono: FiRepeat,        color: 'blue'   },
    { titulo: 'Préstamos Pendientes', valor: '—', icono: FiClipboard,     color: 'yellow' },
  ])
  const [bajoStock, setBajoStock] = useState([])
  const [porVencer, setPorVencer] = useState([])

  useEffect(() => {
    const cargar = async () => {
      try {
        const [materiales, bajoStockData, consumibles, movimientos, prestamos] = await Promise.all([
          materialesService.getAll().catch(() => []),
          materialesService.getBajoStock().catch(() => []),
          materialesService.getAllConsumibles().catch(() => []),
          movimientosService.getAll().catch(() => []),
          prestamosService.getAll().catch(() => []),
        ])

        const matList   = normalizeList(materiales)
        const bsList    = normalizeList(bajoStockData)
        const consList  = normalizeList(consumibles)
        const movList   = normalizeList(movimientos)
        const presList  = normalizeList(prestamos)

        const hoy30 = new Date(); hoy30.setDate(hoy30.getDate() + 30)
        const vencientesList = consList.filter((c) => {
          if (!c.fechaVencimiento) return false
          const fv = new Date(c.fechaVencimiento)
          return fv <= hoy30
        }).sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento))
        setPorVencer(vencientesList)

        const hoy    = new Date().toISOString().split('T')[0]
        const movHoy = movList.filter((m) =>
          (m.fecha ?? m.creadoEn ?? '').toString().startsWith(hoy)
        ).length

        const pendientes = presList.filter(
          (p) => (p.estado ?? '').toLowerCase() === 'pendiente'
        ).length

        setKpis([
          { titulo: 'Total Materiales',     valor: matList.length.toString(), icono: FiPackage,       color: 'green',  subtitulo: 'en inventario' },
          { titulo: 'Stock Bajo',           valor: bsList.length.toString(),  icono: FiAlertTriangle, color: 'red',    subtitulo: 'requieren atención' },
          { titulo: 'Movimientos Hoy',      valor: movHoy.toString(),         icono: FiRepeat,        color: 'blue',   subtitulo: 'entradas y salidas' },
          { titulo: 'Préstamos Pendientes', valor: pendientes.toString(),     icono: FiClipboard,     color: 'yellow', subtitulo: 'esperando aprobación' },
        ])
        setBajoStock(bsList)
      } catch {
        // mantiene valores '—'
      }
    }
    cargar()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-7">

        {/* Encabezado con saludo */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{saludo()}, {primerNombre} 👋</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-0.5">Panel de Control</h1>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.titulo} {...kpi} />
          ))}
        </div>

        {/* Alerta de stock bajo */}
        {bajoStock.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiAlertTriangle className="text-red-500 shrink-0" size={18} />
              <h2 className="font-semibold text-red-700 text-sm">
                {bajoStock.length} consumible{bajoStock.length > 1 ? 's' : ''} con stock crítico
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-red-600 border-b border-red-200">
                    <th className="pb-2 font-semibold">Material</th>
                    <th className="pb-2 font-semibold text-right">Stock actual</th>
                    <th className="pb-2 font-semibold text-right">Stock mínimo</th>
                    <th className="pb-2 font-semibold text-right">Unidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100">
                  {bajoStock.map((item) => (
                    <tr key={item.id} className="text-gray-700">
                      <td className="py-1.5">{item.materiale?.nombre ?? '—'}</td>
                      <td className="py-1.5 text-right font-semibold text-red-600">{item.stockActual}</td>
                      <td className="py-1.5 text-right">{item.stockMinimo}</td>
                      <td className="py-1.5 text-right text-gray-500">{item.unidadMedida}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Alerta de consumibles por vencer */}
        {porVencer.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiClock className="text-amber-500 shrink-0" size={18} />
              <h2 className="font-semibold text-amber-700 text-sm">
                {porVencer.length} consumible{porVencer.length > 1 ? 's' : ''} próximo{porVencer.length > 1 ? 's' : ''} a vencer
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-amber-600 border-b border-amber-200">
                    <th className="pb-2 font-semibold">Material</th>
                    <th className="pb-2 font-semibold text-right">Stock</th>
                    <th className="pb-2 font-semibold text-right">Unidad</th>
                    <th className="pb-2 font-semibold text-right">Vence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {porVencer.map((item) => {
                    const fv    = new Date(item.fechaVencimiento)
                    const dias  = Math.floor((fv - Date.now()) / 86_400_000)
                    const label = dias < 0 ? `Venció hace ${Math.abs(dias)}d` : dias === 0 ? 'Vence hoy' : `En ${dias}d`
                    return (
                      <tr key={item.id} className="text-gray-700">
                        <td className="py-1.5">{item.materiale?.nombre ?? '—'}</td>
                        <td className="py-1.5 text-right">{item.stockActual}</td>
                        <td className="py-1.5 text-right text-gray-500">{item.unidadMedida}</td>
                        <td className={`py-1.5 text-right font-semibold ${dias < 0 ? 'text-red-600' : 'text-amber-600'}`}>{label}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <GraficosSection />
        <TablaMovimientos />
      </div>
    </DashboardLayout>
  )
}
