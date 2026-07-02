import { useState, useRef, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiX } from 'react-icons/fi'
import { CODIGOS_UNSPSC, CATEGORIAS_UNSPSC } from '@/data/codigosUnspsc'

/**
 * Selector con búsqueda para códigos UNSPSC.
 * Props:
 *   value      – código seleccionado (string) o null
 *   onChange   – fn(codigoObj | null)  donde codigoObj = { codigo, nombre, unidades, categoria }
 *   error      – mensaje de error
 *   label      – etiqueta del campo
 */
export const SelectorUnspsc = ({ value, onChange, error, label = 'Código UNSPSC' }) => {
  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const inputRef = useRef(null)
  const wrapRef  = useRef(null)

  const seleccionado = CODIGOS_UNSPSC.find(c => c.codigo === value) ?? null

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setAbierto(false)
        setBusqueda('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Foco al input de búsqueda cuando se abre
  useEffect(() => {
    if (abierto) inputRef.current?.focus()
  }, [abierto])

  const filtrados = CODIGOS_UNSPSC.filter(c => {
    if (!busqueda.trim()) return true
    const q = busqueda.toLowerCase()
    return c.codigo.includes(q) || c.nombre.toLowerCase().includes(q)
  })

  // Agrupar por categoría
  const grupos = {}
  filtrados.forEach(c => {
    if (!grupos[c.categoria]) grupos[c.categoria] = []
    grupos[c.categoria].push(c)
  })

  const seleccionar = (item) => {
    onChange(item)
    setAbierto(false)
    setBusqueda('')
  }

  const limpiar = (e) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div className="space-y-1.5 w-full" ref={wrapRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}{' '}
          <span className="text-xs font-normal text-gray-400">(Colombia Compra Eficiente)</span>
        </label>
      )}

      {/* Botón disparador */}
      <button
        type="button"
        onClick={() => setAbierto(v => !v)}
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-md text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 ${
          error
            ? 'border-red-400'
            : abierto
              ? 'border-green-500 ring-2 ring-green-500 ring-offset-1'
              : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <span className={seleccionado ? 'text-gray-900' : 'text-gray-400'}>
          {seleccionado ? `${seleccionado.codigo} - ${seleccionado.nombre}` : 'Seleccione el código UNSPSC'}
        </span>
        <span className="flex items-center gap-1 shrink-0 ml-2">
          {seleccionado && (
            <span
              role="button"
              onClick={limpiar}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX size={14} />
            </span>
          )}
          <FiChevronDown size={15} className={`text-gray-400 transition-transform ${abierto ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Dropdown */}
      {abierto && (
        <div className="absolute z-50 mt-1 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Búsqueda */}
          <div className="p-2 border-b border-gray-100 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              ref={inputRef}
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Escriba el código o nombre del producto..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Lista */}
          <div className="max-h-64 overflow-y-auto">
            {Object.entries(grupos).length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-6">Sin resultados</p>
            ) : (
              Object.entries(grupos).map(([cat, items]) => (
                <div key={cat}>
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wide">
                    {CATEGORIAS_UNSPSC[cat] ?? cat}
                  </div>
                  {items.map(item => (
                    <button
                      key={item.codigo}
                      type="button"
                      onClick={() => seleccionar(item)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition-colors ${
                        value === item.codigo ? 'bg-green-50 text-[#39A900] font-medium' : 'text-gray-700'
                      }`}
                    >
                      <span className="font-mono text-xs text-gray-500">{item.codigo}</span>
                      {' — '}
                      <span>{item.nombre}</span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
