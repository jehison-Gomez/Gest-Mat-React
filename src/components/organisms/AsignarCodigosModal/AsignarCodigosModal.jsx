import { useState } from 'react'
import { FiX, FiZap, FiCheck } from 'react-icons/fi'
import { materialesService } from '@/services/materialesService'
import { useToast } from '@/hooks/useToast'
import { Boton } from '@/components/atoms/Boton/Boton'

/**
 * Modal que aparece después de registrar múltiples ítems devolutivos.
 * Permite personalizar la Placa SENA de cada unidad.
 *
 * Props:
 *   items           – array de { id, codigoSena } retornados por crearItem
 *   nombreMaterial  – nombre del material (solo para mostrar)
 *   onCerrar        – fn llamada al omitir (sin guardar)
 *   onGuardado      – fn llamada cuando las placas se guardan exitosamente
 */
export const AsignarCodigosModal = ({ items, nombreMaterial, onCerrar, onGuardado }) => {
  const toast    = useToast()
  const [placas, setPlacas] = useState(
    items.map(item => ({ id: item.id, codigo: item.codigoSena ?? '' }))
  )
  const [guardando, setGuardando] = useState(false)
  const [error,     setError]     = useState('')

  /* ── handlers ───────────────────────────────── */
  const handleChange = (index, value) => {
    setPlacas(prev => prev.map((c, i) => i === index ? { ...c, codigo: value } : c))
  }

  // A partir de la placa del ítem #1, rellena el resto con secuencia
  const completarSecuencia = () => {
    const base = placas[0].codigo.trim()
    if (!base) return

    // Detecta sufijo numérico: "COMP-PORTÁTIL-001" → prefijo="COMP-PORTÁTIL-", num=1, pad=3
    const match = base.match(/^(.*?)(\d+)$/)
    if (!match) {
      toast.error('La Placa SENA #1 debe terminar en número (ej: COMP-PORT-001)')
      return
    }

    const prefijo = match[1]
    const numBase = parseInt(match[2], 10)
    const pad     = match[2].length

    setPlacas(prev =>
      prev.map((c, i) =>
        i === 0
          ? c
          : { ...c, codigo: `${prefijo}${String(numBase + i).padStart(pad, '0')}` }
      )
    )
  }

  const handleGuardar = async () => {
    const valores = placas.map(c => c.codigo.trim())

    if (valores.some(v => !v)) {
      return setError('Todas las Placas SENA deben estar completas.')
    }
    const unicos = new Set(valores)
    if (unicos.size !== valores.length) {
      return setError('Las Placas SENA deben ser únicas. Revisa los valores repetidos.')
    }

    setError('')
    setGuardando(true)
    try {
      await Promise.all(
        placas.map(({ id, codigo }) =>
          materialesService.actualizarItem(id, { codigoSena: codigo.trim() })
        )
      )
      toast.success('Placas SENA asignadas correctamente')
      onGuardado?.()
    } catch (e) {
      const msg = e?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(' | ') : msg || 'Error al guardar las placas.')
    } finally {
      setGuardando(false)
    }
  }

  /* ── detectar duplicados en tiempo real ─────── */
  const valoresTrim = placas.map(c => c.codigo.trim())
  const conteo      = valoresTrim.reduce((acc, v) => {
    if (v) acc[v] = (acc[v] ?? 0) + 1
    return acc
  }, {})
  const esDuplicado = (i) => {
    const v = valoresTrim[i]
    return v && conteo[v] > 1
  }

  /* ── render ─────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Asignar Placas SENA</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {items.length} unidades de <span className="font-medium text-gray-600">{nombreMaterial}</span>
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 pt-4 pb-2 shrink-0 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Edita la placa del <strong>#1</strong> y usa{' '}
            <span className="font-semibold text-[#39A900]">Completar secuencia</span>{' '}
            para rellenar el resto automáticamente.
          </p>
          <button
            type="button"
            onClick={completarSecuencia}
            disabled={guardando || !placas[0]?.codigo.trim()}
            className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#39A900] text-[#39A900] hover:bg-[#39A900]/8 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FiZap size={13} />
            Completar secuencia
          </button>
        </div>

        {/* Lista de ítems */}
        <div className="px-6 pb-2 overflow-y-auto flex-1">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-3">
              {error}
            </p>
          )}

          <div className="space-y-2">
            {placas.map((c, i) => {
              const duplicado  = esDuplicado(i)
              const vacio      = !c.codigo.trim()
              const tieneError = duplicado || (error && vacio)
              return (
                <div key={c.id} className="flex items-center gap-3">
                  {/* Número */}
                  <span className={`text-xs font-mono w-8 shrink-0 text-center py-1 rounded-md ${
                    i === 0
                      ? 'bg-[#39A900]/10 text-[#39A900] font-bold'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    #{i + 1}
                  </span>

                  {/* Input */}
                  <input
                    type="text"
                    value={c.codigo}
                    onChange={e => handleChange(i, e.target.value)}
                    disabled={guardando}
                    placeholder={`Placa SENA unidad ${i + 1}`}
                    className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      tieneError
                        ? 'border-red-400 focus:ring-red-400 bg-red-50'
                        : 'border-gray-200 focus:ring-[#39A900] focus:border-[#39A900]'
                    }`}
                  />

                  {/* Indicador */}
                  {!vacio && !duplicado && (
                    <FiCheck size={16} className="text-[#39A900] shrink-0" />
                  )}
                  {duplicado && (
                    <span className="text-[10px] text-red-500 font-medium shrink-0">
                      Duplicado
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onCerrar}
            disabled={guardando}
            className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 transition-colors"
          >
            Omitir (mantener placas auto-generadas)
          </button>
          <Boton
            type="button"
            variante="primario"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : 'Guardar placas'}
          </Boton>
        </div>
      </div>
    </div>
  )
}
