import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { KpiCard } from '@/components/molecules/KpiCard/KpiCard'
import { GraficosSection } from '@/components/organisms/GraficosSection/GraficosSection'
import { TablaMovimientos } from '@/components/organisms/TablaMovimientos/TablaMovimientos'
import { FiPackage, FiAlertTriangle, FiRepeat, FiClipboard } from 'react-icons/fi'
import { materialesService } from '@/services/materialesService'
import { movimientosService } from '@/services/movimientosService'
import { prestamosService } from '@/services/prestamosService'
import { useAuth } from '@/hooks/useAuth'

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

  useEffect(() => {
    const cargar = async () => {
      try {
        const [materiales, consumibles, movimientos, prestamos] = await Promise.all([
          materialesService.getAll().catch(() => []),
          materialesService.getAllConsumibles().catch(() => []),
          movimientosService.getAll().catch(() => []),
          prestamosService.getAll().catch(() => []),
        ])

        const matList  = Array.isArray(materiales)  ? materiales  : (materiales?.data  ?? [])
        const consList = Array.isArray(consumibles) ? consumibles : (consumibles?.data ?? [])
        const movList  = Array.isArray(movimientos) ? movimientos : (movimientos?.data  ?? [])
        const presList = Array.isArray(prestamos)   ? prestamos   : (prestamos?.data   ?? [])

        const stockBajo = consList.filter(
          (c) => Number(c.stockActual ?? 0) <= Number(c.stockMinimo ?? 0)
        ).length

        const hoy    = new Date().toISOString().split('T')[0]
        const movHoy = movList.filter((m) =>
          (m.fecha ?? m.creadoEn ?? '').toString().startsWith(hoy)
        ).length

        const pendientes = presList.filter(
          (p) => (p.estado ?? '').toLowerCase() === 'pendiente'
        ).length

        setKpis([
          { titulo: 'Total Materiales',     valor: matList.length.toString(),  icono: FiPackage,      color: 'green',  subtitulo: 'en inventario' },
          { titulo: 'Stock Bajo',           valor: stockBajo.toString(),        icono: FiAlertTriangle,color: 'red',    subtitulo: 'requieren atención' },
          { titulo: 'Movimientos Hoy',      valor: movHoy.toString(),           icono: FiRepeat,       color: 'blue',   subtitulo: 'entradas y salidas' },
          { titulo: 'Préstamos Pendientes', valor: pendientes.toString(),       icono: FiClipboard,    color: 'yellow', subtitulo: 'esperando aprobación' },
        ])
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

        <GraficosSection />
        <TablaMovimientos />
      </div>
    </DashboardLayout>
  )
}
