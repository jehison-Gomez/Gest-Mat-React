import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
  AreaChart, Area, PieChart, Pie, ResponsiveContainer,
} from 'recharts'
import { materialesService } from '@/services/materialesService'
import { movimientosService } from '@/services/movimientosService'
import { prestamosService } from '@/services/prestamosService'

const VERDE = '#39A900'
const COLORS = ['#39A900', '#4F7DF3', '#F59E0B', '#EF4444', '#A855F7', '#64748B']

const ESTADO_COLORS = {
  PENDIENTE:          '#F59E0B',
  APROBADO:           '#4F7DF3',
  ENTREGADO:          '#39A900',
  DEVUELTO:           '#64748B',
  RECHAZADO:          '#EF4444',
  VENCIDO:            '#DC2626',
  MODIFICADO:         '#8B5CF6',
  DEVOLUCION_PARCIAL: '#A855F7',
}

const ESTADO_LABEL = {
  PENDIENTE:          'Pendiente',
  APROBADO:           'Aprobado',
  ENTREGADO:          'Entregado',
  DEVUELTO:           'Devuelto',
  RECHAZADO:          'Rechazado',
  VENCIDO:            'Vencido',
  MODIFICADO:         'Modificado',
  DEVOLUCION_PARCIAL: 'Dev. Parcial',
}

const GraficoCard = ({ titulo, subtitulo, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
    <div>
      <h3 className="text-sm font-bold text-gray-800">{titulo}</h3>
      {subtitulo && <p className="text-xs text-gray-400 mt-0.5">{subtitulo}</p>}
    </div>
    {children}
  </div>
)

const TooltipBase = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2.5 text-xs min-w-[110px]">
      {label && <p className="font-semibold text-gray-700 mb-1.5 text-[11px]">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.fill ?? p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-bold text-gray-800 ml-auto pl-2">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

const EmptyState = ({ text }) => (
  <div className="flex items-center justify-center" style={{ height: 200 }}>
    <p className="text-sm text-gray-300">{text}</p>
  </div>
)

const Skeleton = () => (
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
        <div className="h-3.5 w-36 bg-gray-100 rounded mb-1.5" />
        <div className="h-2.5 w-52 bg-gray-50 rounded mb-5" />
        <div className="bg-gray-50 rounded-xl" style={{ height: 200 }} />
      </div>
    ))}
  </div>
)

export const GraficosSection = () => {
  const [stockData,        setStockData]        = useState([])
  const [evolucionData,    setEvolucionData]    = useState([])
  const [ubicacionData,    setUbicacionData]    = useState([])
  const [estadosPrestamos, setEstadosPrestamos] = useState([])
  const [cargando,         setCargando]         = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const [consumibles, items, movimientos, prestamos] = await Promise.all([
          materialesService.getAllConsumibles().catch(() => []),
          materialesService.getAllItems().catch(() => []),
          movimientosService.getAll().catch(() => []),
          prestamosService.getAll().catch(() => []),
        ])

        const consList  = Array.isArray(consumibles) ? consumibles : (consumibles?.data ?? [])
        const itemsList = Array.isArray(items)       ? items       : (items?.data ?? [])
        const movList   = Array.isArray(movimientos) ? movimientos : (movimientos?.data ?? [])
        const presList  = Array.isArray(prestamos)   ? prestamos   : (prestamos?.data ?? [])

        /* ── Gráfico 1: Stock actual vs mínimo (top 6 por mayor stock) ── */
        const top6 = [...consList]
          .sort((a, b) => Number(b.stockActual ?? 0) - Number(a.stockActual ?? 0))
          .slice(0, 6)
          .map((c) => {
            const nombre = c.materiale?.nombre ?? c.nombre ?? `#${c.id?.slice(0, 4)}`
            return {
              name:    nombre.length > 14 ? nombre.slice(0, 13) + '…' : nombre,
              tooltip: nombre,
              actual:  Number(c.stockActual ?? 0),
              minimo:  Number(c.stockMinimo ?? 0),
            }
          })
        setStockData(top6)

        /* ── Gráfico 2: Entradas vs Salidas por mes (últimos 6 meses) ── */
        const ahora = new Date()
        const meses = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(ahora.getFullYear(), ahora.getMonth() - 5 + i, 1)
          return {
            mes:      d.toLocaleString('es', { month: 'short' }),
            key:      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            entradas: 0,
            salidas:  0,
          }
        })
        const TIPOS_ENTRADA = new Set(['ENTRADA', 'AJUSTE_POSITIVO', 'DEVOLUCION'])
        movList.forEach((m) => {
          const fecha = (m.fecha ?? m.creadoEn ?? '').toString().slice(0, 7)
          const slot  = meses.find((s) => s.key === fecha)
          if (!slot) return
          const tipo = (m.tipo ?? '').toUpperCase()
          if (TIPOS_ENTRADA.has(tipo)) slot.entradas += 1
          else slot.salidas += 1
        })
        setEvolucionData(meses.map(({ mes, entradas, salidas }) => ({ mes, entradas, salidas })))

        /* ── Gráfico 3: Ítems por ubicación (top 6) ── */
        const porUb = {}
        itemsList.forEach((item) => {
          const ub = item.ubicacion?.nombre ?? item.material?.ubicacion?.nombre ?? 'Sin ubicación'
          porUb[ub] = (porUb[ub] ?? 0) + 1
        })
        const ubData = Object.entries(porUb)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6)
        setUbicacionData(ubData.length > 0 ? ubData : [{ name: 'Sin datos', value: 1 }])

        /* ── Gráfico 4: Préstamos por estado ── */
        const porEstado = {}
        presList.forEach((p) => {
          const est = (p.estado ?? 'OTRO').toUpperCase()
          porEstado[est] = (porEstado[est] ?? 0) + 1
        })
        const orden = ['PENDIENTE', 'APROBADO', 'ENTREGADO', 'DEVUELTO', 'RECHAZADO', 'VENCIDO', 'MODIFICADO', 'DEVOLUCION_PARCIAL']
        const estadosData = orden
          .filter((e) => porEstado[e] !== undefined)
          .map((e) => ({ estado: ESTADO_LABEL[e] ?? e, cantidad: porEstado[e], fill: ESTADO_COLORS[e] ?? '#94A3B8' }))
        Object.entries(porEstado).forEach(([e, cnt]) => {
          if (!orden.includes(e)) estadosData.push({ estado: e, cantidad: cnt, fill: '#94A3B8' })
        })
        setEstadosPrestamos(estadosData)
      } catch {
        /* vacío */
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  if (cargando) return <Skeleton />

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

      {/* ── Gráfico 1: Stock Actual vs Mínimo ── */}
      <GraficoCard titulo="Stock de Consumibles" subtitulo="Stock actual vs nivel mínimo requerido (top 6)">
        {stockData.length === 0
          ? <EmptyState text="Sin consumibles registrados" />
          : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stockData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const fullName = stockData.find(d => d.name === label)?.tooltip ?? label
                    return (
                      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2.5 text-xs">
                        <p className="font-semibold text-gray-700 mb-1.5 max-w-[180px] break-words">{fullName}</p>
                        {payload.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 py-0.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.fill }} />
                            <span className="text-gray-500">{p.name}:</span>
                            <span className="font-bold text-gray-800 ml-auto pl-2">{p.value}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(v) => <span style={{ color: '#6b7280' }}>{v}</span>}
                />
                <Bar dataKey="actual" name="Stock Actual" fill={VERDE}   radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="minimo" name="Stock Mínimo" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )
        }
      </GraficoCard>

      {/* ── Gráfico 2: Movimientos Entradas vs Salidas ── */}
      <GraficoCard titulo="Movimientos del Inventario" subtitulo="Entradas y salidas mensuales (últimos 6 meses)">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={evolucionData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
            <defs>
              <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={VERDE}   stopOpacity={0.22} />
                <stop offset="95%" stopColor={VERDE}   stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gradSalidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<TooltipBase />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(v) => <span style={{ color: '#6b7280' }}>{v}</span>}
            />
            <Area
              type="monotone"
              dataKey="entradas"
              name="Entradas"
              stroke={VERDE}
              fill="url(#gradEntradas)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: VERDE, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="salidas"
              name="Salidas"
              stroke="#EF4444"
              fill="url(#gradSalidas)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </GraficoCard>

      {/* ── Gráfico 3: Ítems por Ubicación (donut + leyenda lateral) ── */}
      <GraficoCard titulo="Ítems por Ubicación" subtitulo="Distribución de ítems devolutivos por bodega física">
        {ubicacionData.length === 0
          ? <EmptyState text="Sin ítems registrados" />
          : (
            <div className="flex items-center gap-4">
              {/* Donut sin labels en las porciones — evita el recorte */}
              <div style={{ flex: '0 0 180px', height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ubicacionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={82}
                      dataKey="value"
                      paddingAngle={3}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {ubicacionData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const d = payload[0]
                        return (
                          <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-xs">
                            <p className="font-semibold text-gray-700">{d.name}</p>
                            <p className="text-gray-500 mt-0.5">{d.value} ítem{d.value !== 1 ? 's' : ''}</p>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Leyenda lateral con porcentaje */}
              <div className="flex-1 min-w-0 flex flex-col gap-2.5 py-1">
                {(() => {
                  const total = ubicacionData.reduce((s, x) => s + x.value, 0)
                  return ubicacionData.map((d, i) => {
                    const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
                    return (
                      <div key={i} className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-xs text-gray-600 truncate flex-1" title={d.name}>
                          {d.name}
                        </span>
                        <span className="text-xs font-bold text-gray-800 shrink-0">{d.value}</span>
                        <span className="text-[10px] text-gray-400 shrink-0 w-8 text-right">{pct}%</span>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          )
        }
      </GraficoCard>

      {/* ── Gráfico 4: Préstamos por Estado ── */}
      <GraficoCard titulo="Estado de Préstamos" subtitulo="Cantidad de préstamos por cada estado del sistema">
        {estadosPrestamos.length === 0
          ? <EmptyState text="Sin préstamos registrados" />
          : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={estadosPrestamos}
                layout="vertical"
                margin={{ top: 4, right: 32, left: -4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="estado"
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0]
                    return (
                      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-xs">
                        <p className="font-semibold text-gray-700">{d.payload.estado}</p>
                        <p className="text-gray-500 mt-0.5">{d.value} préstamo{d.value !== 1 ? 's' : ''}</p>
                      </div>
                    )
                  }}
                />
                <Bar
                  dataKey="cantidad"
                  name="Cantidad"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={20}
                  label={{ position: 'right', fontSize: 11, fill: '#9ca3af' }}
                >
                  {estadosPrestamos.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )
        }
      </GraficoCard>

    </div>
  )
}
