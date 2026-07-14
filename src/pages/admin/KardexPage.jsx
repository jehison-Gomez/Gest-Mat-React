import { useState, useEffect, useMemo } from 'react'
import { FiSearch, FiDownload, FiInbox, FiFilter } from 'react-icons/fi'
import { DashboardLayout }     from '@/components/templates/DashboardLayout/DashboardLayout'
import { Boton }               from '@/components/atoms/Boton/Boton'
import { movimientosService }  from '@/services/movimientosService'
import { materialesService }   from '@/services/materialesService'
import { useToast }            from '@/hooks/useToast'
import { exportToExcel }       from '@/utils/exportToExcel'

/* ── etiquetas de tipo ──────────────────────────────────────────── */
const TIPO_LABEL = {
  ENTRADA:          { label: 'Entrada',          color: 'bg-green-100 text-green-700'  },
  SALIDA_PRESTAMO:  { label: 'Salida Préstamo',  color: 'bg-red-100 text-red-600'     },
  DEVOLUCION:       { label: 'Devolución',       color: 'bg-blue-100 text-blue-700'   },
  AJUSTE_POSITIVO:  { label: 'Ajuste +',         color: 'bg-emerald-100 text-emerald-700' },
  AJUSTE_NEGATIVO:  { label: 'Ajuste −',         color: 'bg-orange-100 text-orange-700'   },
  BAJA:             { label: 'Baja',             color: 'bg-gray-100 text-gray-600'   },
}

const tipoCfg = (tipo) =>
  TIPO_LABEL[(tipo ?? '').toUpperCase()] ?? { label: tipo ?? '—', color: 'bg-gray-100 text-gray-500' }

const formatFecha = (f) =>
  f ? new Date(f).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—'

/* ══════════════════════════════════════════════════════════════════ */
export default function KardexPage() {
  const toast = useToast()

  const [movimientos,  setMovimientos]  = useState([])
  const [consumibles,  setConsumibles]  = useState([])
  const [items,        setItems]        = useState([])
  const [cargando,     setCargando]     = useState(true)

  /* filtros */
  const [busqueda,     setBusqueda]     = useState('')
  const [filtroTipo,   setFiltroTipo]   = useState('')

  /* ── carga inicial ── */
  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      try {
        const [movData, consData, itemsData] = await Promise.all([
          movimientosService.getAll(),
          materialesService.getAllConsumibles(),
          materialesService.getAllItems(),
        ])

        const arrMov  = Array.isArray(movData)   ? movData   : movData?.data   ?? []
        const arrCons = Array.isArray(consData)   ? consData  : consData?.data  ?? []
        const arrItem = Array.isArray(itemsData)  ? itemsData : itemsData?.data ?? []

        setConsumibles(arrCons)
        setItems(arrItem)
        setMovimientos(arrMov)
      } catch {
        toast.error('Error al cargar el kardex')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  /* ── mapas para resolución de nombres ── */
  const mapCons = useMemo(() =>
    new Map(consumibles.map(c => [c.id, {
      nombre:   c.materiale?.nombre ?? 'Consumible',
      unidad:   c.unidadMedida ?? '',
      stock:    c.stockActual ?? 0,
    }])),
  [consumibles])

  const mapItem = useMemo(() =>
    new Map(items.map(i => [i.id, {
      nombre: i.materiale?.nombre ?? 'Ítem',
      placa:  i.codigoSena ?? '',
    }])),
  [items])

  /* ── enriquecer movimientos ── */
  const filas = useMemo(() => {
    return movimientos
      .map(m => {
        const consId = m.materialConsumible?.id ?? m.materialConsumibleId
        const itemId = m.materialItem?.id       ?? m.materialItemId

        const cons = consId ? mapCons.get(consId) : null
        const item = itemId ? mapItem.get(itemId) : null

        const materialNombre = cons?.nombre ?? item?.nombre ?? '—'
        const detalle        = item?.placa  ? `Placa: ${item.placa}` : (cons?.unidad ?? '')
        const tipo           = (m.tipo ?? '').toUpperCase()
        const esSalida       = ['SALIDA_PRESTAMO', 'AJUSTE_NEGATIVO', 'BAJA'].includes(tipo)
        const cantidad       = Number(m.cantidad ?? 0)

        return {
          id:            m.id,
          materialNombre,
          detalle,
          tipo,
          cantidad,
          signo:         esSalida ? -cantidad : cantidad,
          descripcion:   m.descripcion ?? '—',
          usuario:       m.usuario?.nombre ?? '—',
          fecha:         m.creadoEn,
          esMaterial:    !!cons || !!item,
        }
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }, [movimientos, mapCons, mapItem])

  /* ── filtros ── */
  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase()
    return filas.filter(f => {
      const coincideBusqueda =
        f.materialNombre.toLowerCase().includes(q) ||
        f.descripcion.toLowerCase().includes(q)    ||
        f.usuario.toLowerCase().includes(q)        ||
        f.detalle.toLowerCase().includes(q)
      const coincideTipo = !filtroTipo || f.tipo === filtroTipo
      return coincideBusqueda && coincideTipo
    })
  }, [filas, busqueda, filtroTipo])

  /* ── exportar ── */
  const exportar = () => {
    if (filtradas.length === 0) { toast.error('No hay datos para exportar'); return }
    exportToExcel(
      filtradas.map(f => ({
        Material:    f.materialNombre,
        Detalle:     f.detalle,
        Tipo:        tipoCfg(f.tipo).label,
        Cantidad:    f.cantidad,
        Descripción: f.descripcion,
        Usuario:     f.usuario,
        Fecha:       formatFecha(f.fecha),
      })),
      'kardex',
      'Kardex'
    )
    toast.success('Kardex exportado correctamente')
  }

  /* ── tipos únicos para el filtro ── */
  const tiposUnicos = useMemo(() =>
    [...new Set(filas.map(f => f.tipo))].filter(Boolean),
  [filas])

  /* ── totales ── */
  const totalEntradas = filtradas.filter(f => f.signo > 0).reduce((s, f) => s + f.cantidad, 0)
  const totalSalidas  = filtradas.filter(f => f.signo < 0).reduce((s, f) => s + f.cantidad, 0)

  /* ══ RENDER ══════════════════════════════════════════════════════ */
  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Encabezado */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 page-title">Kardex</h1>
            <p className="text-sm text-gray-500 mt-1">
              Historial de todos los movimientos de inventario del centro.
            </p>
          </div>
          <Boton
            variante="secundario"
            className="flex items-center gap-2"
            onClick={exportar}
            disabled={filtradas.length === 0}
          >
            <FiDownload size={15} /> Exportar Excel
          </Boton>
        </div>

        {/* KPIs rápidos */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
            <p className="text-xs text-gray-400 font-medium">Total movimientos</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 font-variant-numeric">{filtradas.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
            <p className="text-xs text-gray-400 font-medium">Total entradas</p>
            <p className="text-2xl font-bold text-green-600 mt-1">+{totalEntradas}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
            <p className="text-xs text-gray-400 font-medium">Total salidas</p>
            <p className="text-2xl font-bold text-red-500 mt-1">−{totalSalidas}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por material, descripción o usuario..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#39A900] transition-colors"
            />
          </div>
          <div className="relative">
            <FiFilter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              className="pl-8 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#39A900] bg-white text-gray-700 transition-colors appearance-none cursor-pointer"
            >
              <option value="">Todos los tipos</option>
              {tiposUnicos.map(t => (
                <option key={t} value={t}>{tipoCfg(t).label}</option>
              ))}
            </select>
          </div>
          {(busqueda || filtroTipo) && (
            <button
              onClick={() => { setBusqueda(''); setFiltroTipo('') }}
              className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Cabecera fija */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#39A900]">
                  {['Material', 'Tipo', 'Cantidad', 'Descripción', 'Usuario', 'Fecha'].map(c => (
                    <th key={c} className="px-5 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>

          {/* Cuerpo con scroll */}
          <div className="overflow-y-auto overflow-x-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
            <table className="w-full text-sm">
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="w-8 h-8 border-2 border-[#39A900] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-sm text-gray-400 mt-3">Cargando kardex...</p>
                    </td>
                  </tr>
                ) : filtradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <FiInbox size={36} className="mx-auto text-gray-200 mb-3" />
                      <p className="text-sm font-medium text-gray-400">
                        {busqueda || filtroTipo ? 'Sin resultados para los filtros aplicados' : 'No hay movimientos registrados aún'}
                      </p>
                      {(busqueda || filtroTipo) && (
                        <button
                          onClick={() => { setBusqueda(''); setFiltroTipo('') }}
                          className="text-xs text-[#39A900] mt-2 underline"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filtradas.map((f, i) => {
                    const tc = tipoCfg(f.tipo)
                    const esSalida = f.signo < 0
                    return (
                      <tr
                        key={f.id}
                        className={`border-b border-gray-50 hover:bg-[#39A900]/5 transition-colors ${
                          i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        {/* Material */}
                        <td className="px-5 py-3.5" style={{ width: '22%' }}>
                          <p className="font-semibold text-gray-800 leading-tight">{f.materialNombre}</p>
                          {f.detalle && (
                            <p className="text-xs text-gray-400 font-mono mt-0.5">{f.detalle}</p>
                          )}
                        </td>

                        {/* Tipo */}
                        <td className="px-5 py-3.5" style={{ width: '14%' }}>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${tc.color}`}>
                            {tc.label}
                          </span>
                        </td>

                        {/* Cantidad */}
                        <td className="px-5 py-3.5 font-mono" style={{ width: '10%' }}>
                          <span className={`text-base font-bold ${esSalida ? 'text-red-500' : 'text-green-600'}`}>
                            {esSalida ? '−' : '+'}{f.cantidad}
                          </span>
                        </td>

                        {/* Descripción */}
                        <td className="px-5 py-3.5 text-gray-600 text-sm" style={{ width: '28%' }}>
                          <p className="truncate max-w-xs">{f.descripcion}</p>
                        </td>

                        {/* Usuario */}
                        <td className="px-5 py-3.5 text-gray-500 text-sm" style={{ width: '14%' }}>
                          {f.usuario}
                        </td>

                        {/* Fecha */}
                        <td className="px-5 py-3.5 text-gray-400 text-xs" style={{ width: '12%' }}>
                          {formatFecha(f.fecha)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pie */}
          {!cargando && filtradas.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-gray-600">{filtradas.length}</span> movimiento{filtradas.length !== 1 ? 's' : ''}
                {(busqueda || filtroTipo) && ` · filtrado${filtradas.length !== 1 ? 's' : ''}`}
              </p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-green-600 font-semibold">▲ Entradas: {totalEntradas}</span>
                <span className="text-red-500 font-semibold">▼ Salidas: {totalSalidas}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}
