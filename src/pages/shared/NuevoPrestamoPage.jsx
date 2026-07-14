import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiAlertCircle } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { InputTexto } from '@/components/atoms/InputTexto/InputTexto'
import { InputFecha } from '@/components/atoms/InputFecha/InputFecha'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { Boton } from '@/components/atoms/Boton/Boton'
import { prestamosService } from '@/services/prestamosService'
import { materialesService } from '@/services/materialesService'
import { fichasService } from '@/services/fichasService'
import { usuariosService } from '@/services/usuariosService'
import { useAuth, ROLES } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const hoy = () => new Date().toISOString().slice(0, 10)

const VACIO = {
  fichaId: '',
  materialItemId: '',
  beneficiarioId: '',
  motivo: '',
  observacion: '',
  fechaInicio: hoy(),
  fechaFin: '',
  fechaDevolucionEsperada: '',
}

export default function NuevoPrestamoPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, rol } = useAuth()

  // Aprendiz y Vocero: solo piden para sí mismos, no eligen beneficiario
  const esRolBásico = [ROLES.APRENDIZ, ROLES.VOCERO].includes(rol)

  const [fichas, setFichas] = useState([])
  const [items, setItems] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState({ ...VACIO, beneficiarioId: esRolBásico ? user?.id ?? '' : '' })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        const [fichasData, itemsData, usuariosData] = await Promise.all([
          fichasService.getAll(),
          materialesService.getAllItems(),
          esRolBásico ? Promise.resolve([]) : usuariosService.getAll(),
        ])
        setFichas(Array.isArray(fichasData) ? fichasData : fichasData.data ?? [])
        const itemsLista = Array.isArray(itemsData) ? itemsData : itemsData.data ?? []
        setItems(itemsLista.filter((i) => (i.estado ?? '').toUpperCase() === 'DISPONIBLE'))
        setUsuarios(Array.isArray(usuariosData) ? usuariosData : usuariosData.data ?? [])
      } catch {
        toast.error('Error al cargar los datos del formulario')
      }
    }
    cargar()
  }, [])

  const opcionesFichas = fichas.map((f) => ({
    value: f.id,
    label: `${f.codigoFicha ?? f.id} — ${f.programa?.nombre ?? ''}`,
  }))
  const opcionesItems = items.map((i) => {
    const nombre    = i.materiale?.nombre ?? 'Material'
    const placa     = i.codigoSena ?? ''
    const categoria = i.materiale?.categoriaMaterial?.nombre ?? ''
    const ubicacion = i.materiale?.ubicacion?.nombre ?? ''
    const partes    = [categoria, ubicacion].filter(Boolean).join(' · ')
    return {
      value: i.id,
      label: `${nombre} — Placa: ${placa}${partes ? `  (${partes})` : ''}`,
    }
  })
  const opcionesUsuarios = usuarios.map((u) => ({ value: u.id, label: u.nombre }))

  const guardar = async (e) => {
    e.preventDefault()

    if (!form.fichaId) return setError('Selecciona una ficha.')
    if (!form.materialItemId) return setError('Selecciona un material.')
    if (!form.motivo) return setError('El motivo es obligatorio.')
    if (!form.fechaFin) return setError('La fecha fin es obligatoria.')
    if (form.fechaFin < form.fechaInicio) return setError('La fecha de fin no puede ser anterior a la fecha de inicio.')
    if (form.fechaDevolucionEsperada && form.fechaDevolucionEsperada < form.fechaInicio)
      return setError('La fecha de devolución esperada no puede ser anterior a la fecha de inicio.')
    setError('')
    setGuardando(true)
    try {
      const prestamo = await prestamosService.crear({
        motivo: form.motivo,
        observacion: form.observacion || undefined,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        fechaDevolucionEsperada: form.fechaDevolucionEsperada || form.fechaFin,
        solicitanteId: user.id,
        fichaId: form.fichaId,
        beneficiariosIds: form.beneficiarioId ? [form.beneficiarioId] : undefined,
      })

      await prestamosService.agregarItem({
        prestamoId: prestamo.id,
        materialItemId: form.materialItemId,
      })

      toast.success('Préstamo creado correctamente')
      navigate(-1)
    } catch (err) {
      const msg = err?.response?.data?.message
      setError(Array.isArray(msg) ? msg[0] : msg || 'Error al crear el préstamo')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 page-title">Nuevo Préstamo</h1>
            <p className="text-sm text-gray-500 mt-1">Solicita un material para una ficha.</p>
          </div>
        </div>

        <form onSubmit={guardar} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <SelectOpcion
            label="Ficha *"
            placeholder="Selecciona una ficha"
            options={opcionesFichas}
            value={form.fichaId}
            onChange={(e) => setForm({ ...form, fichaId: e.target.value })}
            name="fichaId"
            searchable
          />

          <SelectOpcion
            label="Material (ITEM disponible) *"
            placeholder="Selecciona un material"
            options={opcionesItems}
            value={form.materialItemId}
            onChange={(e) => setForm({ ...form, materialItemId: e.target.value })}
            name="materialItemId"
            searchable
          />

          {!esRolBásico && (
            <SelectOpcion
              label="Beneficiario (opcional)"
              placeholder="Selecciona un usuario"
              options={opcionesUsuarios}
              value={form.beneficiarioId}
              onChange={(e) => setForm({ ...form, beneficiarioId: e.target.value })}
              name="beneficiarioId"
              searchable
            />
          )}

          <InputTexto
            label="Motivo *"
            placeholder="Ej: Práctica de mediciones eléctricas"
            value={form.motivo}
            onChange={(e) => setForm({ ...form, motivo: e.target.value })}
          />

          <InputTexto
            label="Observación (opcional)"
            placeholder="Detalles adicionales"
            value={form.observacion}
            onChange={(e) => setForm({ ...form, observacion: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputFecha
              label="Fecha inicio *"
              name="fechaInicio"
              value={form.fechaInicio}
              onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
            />
            <InputFecha
              label="Fecha fin *"
              name="fechaFin"
              value={form.fechaFin}
              onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
            />
            <InputFecha
              label="Devolución esperada"
              name="fechaDevolucionEsperada"
              value={form.fechaDevolucionEsperada}
              onChange={(e) => setForm({ ...form, fechaDevolucionEsperada: e.target.value })}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <FiAlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <Boton type="button" variante="secundario" onClick={() => navigate(-1)}>
              Cancelar
            </Boton>
            <Boton type="submit" variante="primario" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Crear préstamo'}
            </Boton>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
