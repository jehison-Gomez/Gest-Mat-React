const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const diasEnMes = (mes, anio) => {
  if (!mes) return 31
  return new Date(Number(anio) || 2000, Number(mes), 0).getDate()
}

const selectClass = (hasError) =>
  `px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors appearance-none cursor-pointer ${
    hasError
      ? 'border-red-400 focus:ring-red-100'
      : 'border-gray-200 hover:border-gray-300 focus:border-[#39A900] focus:ring-[#39A900]/15'
  }`

/**
 * Props:
 *   label   – etiqueta del campo
 *   value   – string en formato YYYY-MM-DD (o '' vacío)
 *   onChange – fn({ target: { name, value } }) donde value es YYYY-MM-DD
 *   name    – nombre del campo (para el evento)
 *   error   – mensaje de error
 *   minAnio / maxAnio – rango de años (defecto: hoy-5 a hoy+15)
 */
export const InputFecha = ({
  label,
  value = '',
  onChange,
  name,
  error,
  minAnio,
  maxAnio,
}) => {
  const partes  = value ? value.split('-') : ['', '', '']
  const anioVal = partes[0] || ''
  const mesVal  = partes[1] ? String(Number(partes[1])) : ''
  const diaVal  = partes[2] ? String(Number(partes[2])) : ''

  const anioActual = new Date().getFullYear()
  const desde = minAnio ?? anioActual - 5
  const hasta = maxAnio ?? anioActual + 15
  const anios = Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i)

  const totalDias = diasEnMes(mesVal, anioVal)

  const emitir = (newAnio, newMes, newDia) => {
    if (!newAnio || !newMes || !newDia) {
      onChange?.({ target: { name, value: '' } })
      return
    }
    const d = String(newDia).padStart(2, '0')
    const m = String(newMes).padStart(2, '0')
    onChange?.({ target: { name, value: `${newAnio}-${m}-${d}` } })
  }

  const handleAnio = (e) => emitir(e.target.value, mesVal, diaVal)

  const handleMes = (e) => {
    const newMes  = e.target.value
    const maxDias = diasEnMes(newMes, anioVal)
    const newDia  = diaVal && Number(diaVal) > maxDias ? String(maxDias) : diaVal
    emitir(anioVal, newMes, newDia)
  }

  const handleDia = (e) => emitir(anioVal, mesVal, e.target.value)

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
      )}

      <div className="grid grid-cols-3 gap-2">
        {/* Día */}
        <div className="relative">
          <select
            value={diaVal}
            onChange={handleDia}
            className={`w-full ${selectClass(!!error)}`}
          >
            <option value="">Día</option>
            {Array.from({ length: totalDias }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {String(d).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        {/* Mes */}
        <div className="relative">
          <select
            value={mesVal}
            onChange={handleMes}
            className={`w-full ${selectClass(!!error)}`}
          >
            <option value="">Mes</option>
            {MESES.map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Año */}
        <div className="relative">
          <select
            value={anioVal}
            onChange={handleAnio}
            className={`w-full ${selectClass(!!error)}`}
          >
            <option value="">Año</option>
            {anios.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
