import { useState } from 'react'
import {
  FiPackage, FiClipboard, FiAlertCircle,
  FiClock, FiUsers, FiBarChart2,
  FiGrid, FiPrinter, FiDownload,
} from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { imprimirReporte } from '@/utils/imprimirReporte'
import { exportToExcel } from '@/utils/exportToExcel'
import { useToast } from '@/hooks/useToast'
import api from '@/services/api'

const REPORTES = [
  {
    id: 'inventario',
    titulo: 'Inventario General',
    descripcion: 'Lista completa de materiales registrados con tipo, estado y categoría asignada.',
    Icon: FiPackage,
    bg: 'bg-green-50',
    iconBg: 'bg-[#39A900]',
    textColor: 'text-[#39A900]',
    hoverText: 'hover:text-green-900',
    borderColor: 'border-green-100',
  },
  {
    id: 'prestamos',
    titulo: 'Solicitudes de Préstamo',
    descripcion: 'Historial de solicitudes de préstamo filtrable por estado y solicitante.',
    Icon: FiClipboard,
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-500',
    textColor: 'text-blue-700',
    hoverText: 'hover:text-blue-900',
    borderColor: 'border-blue-100',
  },
  {
    id: 'stock_critico',
    titulo: 'Materiales Inactivos',
    descripcion: 'Materiales con estado inactivo, dado de baja o fuera de uso.',
    Icon: FiAlertCircle,
    bg: 'bg-red-50',
    iconBg: 'bg-red-500',
    textColor: 'text-red-700',
    hoverText: 'hover:text-red-900',
    borderColor: 'border-red-100',
  },
  {
    id: 'prestamos_vencidos',
    titulo: 'Préstamos Vencidos',
    descripcion: 'Préstamos marcados como VENCIDO por superar su fecha límite de devolución.',
    Icon: FiClock,
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-500',
    textColor: 'text-amber-700',
    hoverText: 'hover:text-amber-900',
    borderColor: 'border-amber-100',
  },
  {
    id: 'usuarios',
    titulo: 'Usuarios',
    descripcion: 'Lista de aprendices, instructores y administradores registrados.',
    Icon: FiUsers,
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-600',
    textColor: 'text-purple-700',
    hoverText: 'hover:text-purple-900',
    borderColor: 'border-purple-100',
  },
  {
    id: 'fichas',
    titulo: 'Fichas / Grupos',
    descripcion: 'Listado de fichas de formación con código, programa y estado.',
    Icon: FiGrid,
    bg: 'bg-teal-50',
    iconBg: 'bg-teal-600',
    textColor: 'text-teal-700',
    hoverText: 'hover:text-teal-900',
    borderColor: 'border-teal-100',
  },
  {
    id: 'movimientos',
    titulo: 'Movimientos (Kardex)',
    descripcion: 'Historial completo de entradas, salidas y devoluciones de materiales.',
    Icon: FiBarChart2,
    bg: 'bg-slate-50',
    iconBg: 'bg-slate-600',
    textColor: 'text-slate-700',
    hoverText: 'hover:text-slate-900',
    borderColor: 'border-slate-100',
  },
]

const TIPO_MOV_LABEL = {
  ENTRADA: 'Entrada',
  SALIDA_PRESTAMO: 'Salida Préstamo',
  DEVOLUCION: 'Devolución',
  AJUSTE_POSITIVO: 'Ajuste +',
  AJUSTE_NEGATIVO: 'Ajuste -',
  BAJA: 'Baja',
}

const obtenerDatos = async (id) => {
  let titulo, subtitulo, columnas, filas

  if (id === 'inventario') {
    const res = await api.get('/api/materiales')
    const data = res.data?.data ?? res.data ?? []
    titulo = 'Inventario General'
    subtitulo = `Total de materiales registrados: ${data.length}`
    columnas = [
      { key: 'nombre',    label: 'Material' },
      { key: 'tipo',      label: 'Tipo' },
      { key: 'estado',    label: 'Estado' },
      { key: 'categoria', label: 'Categoría' },
      { key: 'unspsc',    label: 'Cód. UNSPSC' },
    ]
    filas = data.map(m => ({
      nombre:    m.nombre ?? '—',
      tipo:      m.tipo ?? '—',
      estado:    m.estado ?? '—',
      categoria: m.categoriaMaterial?.nombre ?? m.categoria?.nombre ?? '—',
      unspsc:    m.codigoUnspsc ?? '—',
    }))

  } else if (id === 'prestamos') {
    const res = await api.get('/api/prestamos')
    const data = res.data?.data ?? res.data ?? []
    titulo = 'Solicitudes de Préstamo'
    subtitulo = `Total de registros: ${data.length}`
    columnas = [
      { key: 'solicitante',  label: 'Solicitante' },
      { key: 'estado',       label: 'Estado' },
      { key: 'fechaInicio',  label: 'Fecha Inicio' },
      { key: 'fechaFin',     label: 'Fecha Fin' },
      { key: 'devolucion',   label: 'Devolución Esperada' },
    ]
    const fmt = d => d ? new Date(d).toLocaleDateString('es-CO') : '—'
    filas = data.map(p => ({
      solicitante: p.solicitante?.nombre ?? '—',
      estado:      p.estado ?? '—',
      fechaInicio: fmt(p.fechaInicio),
      fechaFin:    fmt(p.fechaFin),
      devolucion:  fmt(p.fechaDevolucionEsperada),
    }))

  } else if (id === 'stock_critico') {
    const res = await api.get('/api/materiales')
    const inactivos = ['INACTIVO', 'BAJA', 'DADO_DE_BAJA', 'DETERIORADO']
    const data = (res.data?.data ?? res.data ?? []).filter(
      m => inactivos.includes(m.estado?.toUpperCase())
    )
    titulo = 'Materiales Inactivos'
    subtitulo = `Materiales fuera de uso: ${data.length}`
    columnas = [
      { key: 'nombre',    label: 'Material' },
      { key: 'tipo',      label: 'Tipo' },
      { key: 'estado',    label: 'Estado' },
      { key: 'categoria', label: 'Categoría' },
    ]
    filas = data.map(m => ({
      nombre:    m.nombre ?? '—',
      tipo:      m.tipo ?? '—',
      estado:    m.estado ?? '—',
      categoria: m.categoriaMaterial?.nombre ?? m.categoria?.nombre ?? '—',
    }))

  } else if (id === 'prestamos_vencidos') {
    const res = await api.get('/api/prestamos')
    const data = (res.data?.data ?? res.data ?? []).filter(
      (p) => (p.estado ?? '').toUpperCase() === 'VENCIDO'
    )
    titulo = 'Préstamos Vencidos'
    subtitulo = `Préstamos con estado VENCIDO: ${data.length}`
    columnas = [
      { key: 'solicitante', label: 'Solicitante' },
      { key: 'estado',      label: 'Estado' },
      { key: 'fechaFin',    label: 'Fecha Fin' },
      { key: 'devolucion',  label: 'Devolución Esperada' },
    ]
    const fmt = d => d ? new Date(d).toLocaleDateString('es-CO') : '—'
    filas = data.map(p => ({
      solicitante: p.solicitante?.nombre ?? '—',
      estado:      p.estado ?? '—',
      fechaFin:    fmt(p.fechaFin),
      devolucion:  fmt(p.fechaDevolucionEsperada),
    }))

  } else if (id === 'usuarios') {
    const res = await api.get('/api/usuarios')
    const data = res.data?.data ?? res.data ?? []
    titulo = 'Usuarios del Sistema'
    subtitulo = `Total de usuarios registrados: ${data.length}`
    columnas = [
      { key: 'nombre',    label: 'Nombre' },
      { key: 'correo',    label: 'Correo' },
      { key: 'rol',       label: 'Rol' },
      { key: 'estado',    label: 'Estado' },
      { key: 'documento', label: 'N° Documento' },
    ]
    filas = data.map(u => ({
      nombre:    u.nombre ?? '—',
      correo:    u.correo ?? '—',
      rol:       u.role?.nombre ?? u.rol ?? '—',
      estado:    u.estado ?? '—',
      documento: u.numeroDocumento ?? '—',
    }))

  } else if (id === 'fichas') {
    const res = await api.get('/api/fichas')
    const data = res.data?.data ?? res.data ?? []
    titulo = 'Fichas de Formación'
    subtitulo = `Total de fichas registradas: ${data.length}`
    columnas = [
      { key: 'codigo',   label: 'Código Ficha' },
      { key: 'programa', label: 'Programa' },
      { key: 'inicio',   label: 'Fecha Inicio' },
      { key: 'fin',      label: 'Fecha Fin' },
      { key: 'estado',   label: 'Estado' },
    ]
    const fmt = d => d ? new Date(d).toLocaleDateString('es-CO') : '—'
    filas = data.map(f => ({
      codigo:   f.codigoFicha ?? '—',
      programa: f.programa?.nombre ?? '—',
      inicio:   fmt(f.fechaInicio),
      fin:      fmt(f.fechaFin),
      estado:   f.estado ?? '—',
    }))

  } else if (id === 'movimientos') {
    const res = await api.get('/api/movimientos')
    const data = res.data?.data ?? res.data ?? []
    titulo = 'Movimientos (Kardex)'
    subtitulo = `Total de movimientos registrados: ${data.length}`
    columnas = [
      { key: 'tipo',         label: 'Tipo' },
      { key: 'cantidad',     label: 'Cantidad' },
      { key: 'saldoAntes',   label: 'Saldo Anterior' },
      { key: 'saldoDespues', label: 'Saldo Posterior' },
      { key: 'fecha',        label: 'Fecha' },
    ]
    filas = data.map(m => ({
      tipo:         TIPO_MOV_LABEL[m.tipo] ?? m.tipo ?? '—',
      cantidad:     m.cantidad ?? '—',
      saldoAntes:   m.saldoAnterior ?? '—',
      saldoDespues: m.saldoActual ?? '—',
      fecha:        m.creadoEn ? new Date(m.creadoEn).toLocaleDateString('es-CO') : '—',
    }))
  }

  return { titulo, subtitulo, columnas, filas }
}

export default function ReportesPage() {
  const toast = useToast()
  const [cargando, setCargando] = useState({})
  const [cargandoXls, setCargandoXls] = useState({})

  const generar = async (id) => {
    setCargando(prev => ({ ...prev, [id]: true }))
    try {
      const { titulo, subtitulo, columnas, filas } = await obtenerDatos(id)
      imprimirReporte({ titulo, subtitulo, columnas, filas })
      toast.success(`Reporte "${titulo}" listo para imprimir`)
    } catch {
      toast.error('Error al obtener los datos del reporte')
    } finally {
      setCargando(prev => ({ ...prev, [id]: false }))
    }
  }

  const exportar = async (id, titulo) => {
    setCargandoXls(prev => ({ ...prev, [id]: true }))
    try {
      const { filas, columnas } = await obtenerDatos(id)
      const fileName = `${id}-${new Date().toISOString().split('T')[0]}`
      const rows = filas.map((fila) =>
        Object.fromEntries(columnas.map((col) => [col.label, fila[col.key] ?? '—']))
      )
      exportToExcel(rows, fileName, titulo)
      toast.success('Archivo Excel generado')
    } catch {
      toast.error('Error al exportar a Excel')
    } finally {
      setCargandoXls(prev => ({ ...prev, [id]: false }))
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 page-title">Reportes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Genera reportes en PDF o Excel con información actualizada del sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {REPORTES.map(({ id, titulo, descripcion, Icon, bg, iconBg, textColor, hoverText, borderColor }) => (
            <div
              key={id}
              className={`${bg} border ${borderColor} rounded-2xl p-6 flex flex-col gap-4 shadow-sm`}
            >
              <div className={`inline-flex p-3 rounded-xl ${iconBg} w-fit`}>
                <Icon size={22} className="text-white" />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-[15px] leading-snug">{titulo}</h3>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{descripcion}</p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => generar(id)}
                  disabled={cargando[id]}
                  className={`flex items-center gap-2 text-sm font-semibold ${textColor} ${hoverText} transition-colors disabled:opacity-50`}
                >
                  <FiPrinter size={15} />
                  {cargando[id] ? 'Generando...' : 'PDF'}
                </button>
                <button
                  onClick={() => exportar(id, titulo)}
                  disabled={cargandoXls[id]}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50"
                >
                  <FiDownload size={15} />
                  {cargandoXls[id] ? 'Exportando...' : 'Excel'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
