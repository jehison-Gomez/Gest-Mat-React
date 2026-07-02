import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts'
import { materialesService } from '@/services/materialesService'
import { movimientosService } from '@/services/movimientosService'

const COLORS = ['#39A900', '#4F7DF3', '#F59E0B', '#EF4444']

const GraficoCard = ({ titulo, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
    <h3 className="text-sm font-semibold text-gray-700 mb-4">{titulo}</h3>
    {children}
  </div>
)

export const GraficosSection = () => {
  const [stockData, setStockData] = useState([])
  const [evolucionData, setEvolucionData] = useState([])
  const [ubicacionData, setUbicacionData] = useState([])
  const [tipoData, setTipoData] = useState([])

  useEffect(() => {
    const cargar = async () => {
      try {
        const [consumibles, items, movimientos] = await Promise.all([
          materialesService.getAllConsumibles().catch(() => []),
          materialesService.getAllItems().catch(() => []),
          movimientosService.getAll().catch(() => []),
        ])

        const consList = Array.isArray(consumibles) ? consumibles : (consumibles?.data ?? [])
        const itemsList = Array.isArray(items) ? items : (items?.data ?? [])
        const movList = Array.isArray(movimientos) ? movimientos : (movimientos?.data ?? [])

        // Gráfico 1: Stock actual vs mínimo (top 6 consumibles)
        const top6 = consList.slice(0, 6).map((c) => ({
          name: c.material?.nombre ?? c.nombre ?? `#${c.id?.slice(0, 4)}`,
          actual: Number(c.stockActual ?? 0),
          minimo: Number(c.stockMinimo ?? 0),
        }))
        setStockData(top6)

        // Gráfico 2: Evolución de movimientos por mes (últimos 6 meses)
        const ahora = new Date()
        const meses = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(ahora.getFullYear(), ahora.getMonth() - 5 + i, 1)
          return {
            mes: d.toLocaleString('es', { month: 'short' }),
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            total: 0,
          }
        })
        movList.forEach((m) => {
          const fecha = (m.fecha ?? m.creadoEn ?? '').toString().slice(0, 7)
          const found = meses.find((mes) => mes.key === fecha)
          if (found) found.total += 1
        })
        setEvolucionData(meses.map(({ mes, total }) => ({ mes, movimientos: total })))

        // Gráfico 3: Items por ubicación
        const porUbicacion = {}
        itemsList.forEach((item) => {
          const ub = item.ubicacion?.nombre ?? item.material?.ubicacion?.nombre ?? 'Sin ubicación'
          porUbicacion[ub] = (porUbicacion[ub] ?? 0) + 1
        })
        const ubData = Object.entries(porUbicacion)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
        setUbicacionData(ubData.length > 0 ? ubData : [{ name: 'Sin datos', value: 1 }])

        // Gráfico 4: Items vs Consumibles
        setTipoData([
          { name: 'Items', value: itemsList.length },
          { name: 'Consumibles', value: consList.length },
        ])
      } catch {
        // mantiene vacío
      }
    }
    cargar()
  }, [])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <GraficoCard titulo="Stock Actual vs Mínimo (consumibles)">
        {stockData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Sin consumibles registrados</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="actual" name="Stock Actual" fill="#39A900" radius={[4, 4, 0, 0]} />
              <Bar dataKey="minimo" name="Stock Mínimo" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </GraficoCard>

      <GraficoCard titulo="Movimientos por Mes (últimos 6 meses)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={evolucionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="movimientos"
              name="Movimientos"
              stroke="#4F7DF3"
              strokeWidth={2}
              dot={{ fill: '#4F7DF3', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </GraficoCard>

      <GraficoCard titulo="Items por Ubicación">
        {ubicacionData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={ubicacionData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {ubicacionData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </GraficoCard>

      <GraficoCard titulo="Distribución por Tipo de Material">
        {tipoData.every((d) => d.value === 0) ? (
          <p className="text-sm text-gray-400 text-center py-10">Sin materiales registrados</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={tipoData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
              >
                {tipoData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </GraficoCard>
    </div>
  )
}
