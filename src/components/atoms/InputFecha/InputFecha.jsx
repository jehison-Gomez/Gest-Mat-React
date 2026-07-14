import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS  = ['Do','Lu','Ma','Mi','Ju','Vi','Sá']

const parseYMD = (v) => {
  if (!v) return null
  const [y, m, d] = v.split('-').map(Number)
  return isNaN(y) ? null : { y, m, d }
}
const toYMD = (y, m, d) =>
  `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`

const hoyObj = () => {
  const h = new Date()
  return { y: h.getFullYear(), m: h.getMonth() + 1, d: h.getDate() }
}

const formatoBonito = (v) => {
  const p = parseYMD(v)
  if (!p) return null
  return `${String(p.d).padStart(2,'0')} ${MESES[p.m - 1]} ${p.y}`
}

/* ── Calendario (renderizado vía portal) ─────────────────────────── */
function Calendario({ anchorRef, cursor, setCursor, value, onSelect, onClose, minA, maxA }) {
  const [pos,   setPos]   = useState({ top: 0, left: 0, width: 0 })
  const [vista, setVista] = useState('dias') // 'dias' | 'meses' | 'años'
  const calRef = useRef(null)

  // Posicionar debajo del trigger
  useEffect(() => {
    const calcPos = () => {
      if (!anchorRef.current) return
      const r = anchorRef.current.getBoundingClientRect()
      const calH = 340
      setPos({
        left:  r.left + window.scrollX,
        width: r.width,
        top: (window.innerHeight - r.bottom) >= calH
          ? r.bottom + window.scrollY + 6
          : r.top  + window.scrollY - calH - 6,
      })
    }
    calcPos()
    window.addEventListener('resize', calcPos)
    window.addEventListener('scroll', calcPos, true)
    return () => {
      window.removeEventListener('resize', calcPos)
      window.removeEventListener('scroll', calcPos, true)
    }
  }, [anchorRef])

  // Cerrar al clic fuera
  useEffect(() => {
    const fn = (e) => {
      if (
        calRef.current && !calRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) onClose()
    }
    setTimeout(() => document.addEventListener('mousedown', fn), 0)
    return () => document.removeEventListener('mousedown', fn)
  }, [onClose, anchorRef])

  const hoy   = hoyObj()
  const selec = parseYMD(value)

  // ── Vista días ──────────────────────────────────────────────────
  const primerDia  = new Date(cursor.y, cursor.m - 1, 1).getDay()
  const diasDelMes = new Date(cursor.y, cursor.m, 0).getDate()
  const celdas = []
  for (let i = 0; i < primerDia; i++) celdas.push(null)
  for (let d = 1; d <= diasDelMes; d++) celdas.push(d)
  while (celdas.length % 7 !== 0) celdas.push(null)

  const esHoy = (d) => d && cursor.y === hoy.y && cursor.m === hoy.m && d === hoy.d
  const esSel = (d) => d && selec && cursor.y === selec.y && cursor.m === selec.m && d === selec.d
  const fuera = (d) => {
    if (!d) return true
    const ymd = toYMD(cursor.y, cursor.m, d)
    return ymd < `${minA}-01-01` || ymd > `${maxA}-12-31`
  }

  const prevMes = () => setCursor(c => c.m === 1  ? { y: c.y - 1, m: 12 } : { y: c.y, m: c.m - 1 })
  const nextMes = () => setCursor(c => c.m === 12 ? { y: c.y + 1, m: 1  } : { y: c.y, m: c.m + 1 })

  // ── Vista años ──────────────────────────────────────────────────
  const ANOS = Array.from({ length: maxA - minA + 1 }, (_, i) => minA + i)

  return createPortal(
    <div
      ref={calRef}
      style={{ position: 'absolute', top: pos.top, left: pos.left, minWidth: Math.max(pos.width, 288), zIndex: 9999 }}
      className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 select-none"
    >
      {/* ── Cabecera navegación ── */}
      <div className="flex items-center justify-between mb-4">
        {vista === 'dias' && (
          <button type="button" onClick={prevMes}
            disabled={cursor.y <= minA && cursor.m === 1}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-colors"
          >
            <FiChevronLeft size={16} />
          </button>
        )}
        {vista !== 'dias' && <div className="w-8" />}

        <div className="flex items-center gap-1">
          {/* Mes clickeable */}
          {vista !== 'años' && (
            <button
              type="button"
              onClick={() => setVista(v => v === 'meses' ? 'dias' : 'meses')}
              className={`px-2 py-1 rounded-lg text-sm font-bold transition-colors ${
                vista === 'meses' ? 'bg-[#39A900]/10 text-[#39A900]' : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              {MESES[cursor.m - 1]}
            </button>
          )}

          {/* Año clickeable */}
          <button
            type="button"
            onClick={() => setVista(v => v === 'años' ? 'dias' : 'años')}
            className={`px-2 py-1 rounded-lg text-sm font-bold transition-colors ${
              vista === 'años' ? 'bg-[#39A900]/10 text-[#39A900]' : 'text-gray-800 hover:bg-gray-100'
            }`}
          >
            {cursor.y}
          </button>
        </div>

        {vista === 'dias' && (
          <button type="button" onClick={nextMes}
            disabled={cursor.y >= maxA && cursor.m === 12}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-colors"
          >
            <FiChevronRight size={16} />
          </button>
        )}
        {vista !== 'dias' && <div className="w-8" />}
      </div>

      {/* ── Vista: días ── */}
      {vista === 'dias' && (
        <>
          <div className="grid grid-cols-7 mb-1">
            {DIAS.map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-gray-400 pb-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {celdas.map((d, i) => {
              if (!d) return <div key={`x${i}`} />
              const sel  = esSel(d)
              const hoyD = esHoy(d)
              const off  = fuera(d)
              return (
                <button
                  key={d} type="button" disabled={off}
                  onClick={() => onSelect(toYMD(cursor.y, cursor.m, d))}
                  className={`mx-auto h-8 w-8 flex items-center justify-center rounded-full text-[13px] font-medium transition-all
                    ${off  ? 'text-gray-200 cursor-not-allowed' : ''}
                    ${!off && !sel && !hoyD ? 'text-gray-700 hover:bg-[#39A900]/10 hover:text-[#39A900]' : ''}
                    ${hoyD && !sel ? 'text-[#39A900] font-bold ring-2 ring-[#39A900]/25' : ''}
                    ${sel  ? 'bg-[#39A900] text-white font-bold shadow-md shadow-[#39A900]/25' : ''}
                  `}
                >
                  {d}
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* ── Vista: meses ── */}
      {vista === 'meses' && (
        <div className="grid grid-cols-3 gap-2">
          {MESES.map((mes, i) => {
            const esCursorMes = cursor.m === i + 1
            return (
              <button
                key={mes} type="button"
                onClick={() => { setCursor(c => ({ ...c, m: i + 1 })); setVista('dias') }}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                  esCursorMes
                    ? 'bg-[#39A900] text-white shadow-md shadow-[#39A900]/25'
                    : 'text-gray-700 hover:bg-[#39A900]/10 hover:text-[#39A900]'
                }`}
              >
                {mes.slice(0, 3)}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Vista: años ── */}
      {vista === 'años' && (
        <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {ANOS.map(y => {
            const esCursorAno = cursor.y === y
            return (
              <button
                key={y} type="button"
                onClick={() => { setCursor(c => ({ ...c, y })); setVista('dias') }}
                className={`py-2 rounded-xl text-sm font-medium transition-all ${
                  esCursorAno
                    ? 'bg-[#39A900] text-white shadow-md shadow-[#39A900]/25'
                    : 'text-gray-700 hover:bg-[#39A900]/10 hover:text-[#39A900]'
                }`}
              >
                {y}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Pie ── */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <button type="button" onClick={() => { onSelect(''); setVista('dias') }}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Borrar
        </button>
        <button type="button"
          onClick={() => { const h = hoyObj(); setCursor({ y: h.y, m: h.m }); onSelect(toYMD(h.y, h.m, h.d)); setVista('dias') }}
          className="text-xs font-semibold text-[#39A900] hover:text-[#39A900]/80 transition-colors"
        >
          Hoy
        </button>
      </div>
    </div>,
    document.body
  )
}

/* ── InputFecha ──────────────────────────────────────────────────── */
export const InputFecha = ({ label, value = '', onChange, name, error, minAnio, maxAnio }) => {
  const anioActual = new Date().getFullYear()
  const minA = minAnio ?? anioActual - 5
  const maxA = maxAnio ?? anioActual + 15

  const parsed = parseYMD(value)
  const [abierto, setAbierto]   = useState(false)
  const [cursor,  setCursor]    = useState(() => {
    if (parsed) return { y: parsed.y, m: parsed.m }
    const h = new Date()
    return { y: h.getFullYear(), m: h.getMonth() + 1 }
  })
  const triggerRef = useRef(null)

  useEffect(() => {
    if (parsed) setCursor({ y: parsed.y, m: parsed.m })
  }, [value])

  const handleSelect = useCallback((ymd) => {
    onChange?.({ target: { name, value: ymd } })
    setAbierto(false)
  }, [onChange, name])

  const handleClose = useCallback(() => setAbierto(false), [])

  const limpiar = (e) => {
    e.stopPropagation()
    onChange?.({ target: { name, value: '' } })
  }

  const texto = formatoBonito(value)

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
      )}

      {/* Trigger */}
      <div ref={triggerRef} className="relative">
        <button
          type="button"
          onClick={() => setAbierto(a => !a)}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${
            error
              ? 'border-red-400 bg-red-50 focus:ring-red-200'
              : abierto
                ? 'border-[#39A900] ring-2 ring-[#39A900]/15 bg-white'
                : value
                  ? 'border-[#39A900]/40 bg-[#39A900]/5 hover:border-[#39A900]/70'
                  : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <FiCalendar size={15} className={`shrink-0 ${value ? 'text-[#39A900]' : 'text-gray-400'}`} />

          <span className={`flex-1 ${value ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
            {texto ?? 'Seleccionar fecha'}
          </span>

          {value ? (
            <span
              onClick={limpiar}
              className="shrink-0 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <FiX size={13} />
            </span>
          ) : (
            <span className="text-gray-300 text-xs shrink-0">▾</span>
          )}
        </button>
      </div>

      {/* Calendario via portal */}
      {abierto && (
        <Calendario
          anchorRef={triggerRef}
          cursor={cursor}
          setCursor={setCursor}
          value={value}
          onSelect={handleSelect}
          onClose={handleClose}
          minA={minA}
          maxA={maxA}
        />
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
