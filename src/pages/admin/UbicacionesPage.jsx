import { useState, useEffect } from 'react'
import { FiPlus } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { ModalFormularioSimple } from '@/components/organisms/ModalFormularioSimple/ModalFormularioSimple'
import { ModalConfirmacion } from '@/components/molecules/ModalConfirmacion/ModalConfirmacion'
import { Boton } from '@/components/atoms/Boton/Boton'
import { InputTexto } from '@/components/atoms/InputTexto/InputTexto'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { Badge } from '@/components/atoms/Badge/Badge'
import { AccionesFila } from '@/components/molecules/AccionesFila/AccionesFila'
import { ubicacionesService } from '@/services/ubicacionesService'
import { tiposUbicacionService } from '@/services/tiposUbicacionService'
import { areasService } from '@/services/areasService'
import { useToast } from '@/hooks/useToast'

const VACIO = { nombre: '', descripcion: '', tipoUbicacionId: '', areaId: '', estado: 'activo' }

const ESTADOS = [
  { value: 'activo',   label: 'Activo'   },
  { value: 'inactivo', label: 'Inactivo' },
]

export default function UbicacionesPage() {
  const toast = useToast()
  const [lista, setLista] = useState([])
  const [tipos, setTipos] = useState([])
  const [areas, setAreas] = useState([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [eliminar, setEliminar] = useState(null)

  useEffect(() => {
    cargar()
    cargarOpciones()
  }, [])

  const cargar = async () => {
    try {
      const data = await ubicacionesService.getAll()
      setLista(Array.isArray(data) ? data : data.data ?? [])
    } catch { toast.error('Error al cargar ubicaciones') }
  }

  const cargarOpciones = async () => {
    try {
      const [tiposData, areasData] = await Promise.all([
        tiposUbicacionService.getAll(),
        areasService.getAll(),
      ])
      const arrTipos = Array.isArray(tiposData) ? tiposData : tiposData.data ?? []
      const arrAreas = Array.isArray(areasData) ? areasData : areasData.data ?? []
      setTipos(arrTipos.map(t => ({ value: t.id, label: t.nombre })))
      setAreas(arrAreas.map(a => ({ value: a.id, label: a.nombre })))
    } catch { toast.error('Error al cargar opciones') }
  }

  const abrir = (item = null) => {
    setEditando(item)
    setForm(item ? {
      nombre: item.nombre ?? '',
      descripcion: item.descripcion ?? '',
      tipoUbicacionId: item.tipoUbicacion?.id ?? item.tipoUbicacionId ?? '',
      areaId: item.area?.id ?? item.areaId ?? '',
      estado: item.estado ?? 'activo',
    } : VACIO)
    setError('')
    setModal(true)
  }

  const guardar = async () => {
    if (!form.nombre) return setError('El nombre es obligatorio.')
    if (!form.tipoUbicacionId) return setError('Selecciona un tipo de ubicación.')
    if (!form.areaId) return setError('Selecciona un área.')
    setCargando(true)
    try {
      const datos = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        tipoUbicacionId: form.tipoUbicacionId,
        areaId: form.areaId,
        estado: form.estado,
      }
      editando
        ? await ubicacionesService.actualizar(editando.id, datos)
        : await ubicacionesService.crear(datos)
      toast.success(editando ? 'Ubicación actualizada' : 'Ubicación creada')
      setModal(false)
      cargar()
    } catch (e) {
      const msg = e?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(' | ') : msg || 'Error al guardar')
    } finally { setCargando(false) }
  }

  const confirmarEliminar = async () => {
    try {
      await ubicacionesService.eliminar(eliminar.id)
      toast.success('Ubicación eliminada')
      setEliminar(null)
      cargar()
    } catch { toast.error('Error al eliminar'); setEliminar(null) }
  }

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 page-title">Ubicaciones</h1>
              <p className="text-sm text-gray-500 mt-1">Administra las ubicaciones físicas disponibles en el sistema.</p>
            </div>
            <Boton variante="primario" className="flex items-center gap-2" onClick={() => abrir()}>
              <FiPlus size={16} /> Añadir Ubicación
            </Boton>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#39A900]">
                  {['Nombre', 'Descripción', 'Tipo de Ubicación', 'Área', 'Estado', 'Acciones'].map(c => (
                    <th key={c} className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lista.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Sin ubicaciones registradas</td></tr>
                ) : lista.map(u => (
                  <tr key={u.id} className="hover:bg-[#39A900]/5 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{u.nombre}</td>
                    <td className="px-5 py-4 text-gray-600 max-w-xs truncate">{u.descripcion ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-600">{u.tipoUbicacion?.nombre ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-600">{u.area?.nombre ?? '—'}</td>
                    <td className="px-5 py-4">
                      <Badge variante={u.estado === 'activo' ? 'success' : 'default'}>{u.estado ?? 'activo'}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <AccionesFila onEditar={() => abrir(u)} onEliminar={() => setEliminar(u)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>

      <ModalFormularioSimple
        titulo={editando ? 'Editar Ubicación' : 'Añadir Ubicación'}
        visible={modal}
        onGuardar={guardar}
        onCerrar={() => setModal(false)}
        error={error}
        cargando={cargando}
      >
        <InputTexto
          label="Nombre *"
          value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })}
          placeholder="Ej: Ambiente Y-12"
        />
        <InputTexto
          label="Descripción"
          value={form.descripcion}
          onChange={e => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Descripción de la ubicación"
        />
        <SelectOpcion
          label="Tipo de Ubicación *"
          placeholder="Selecciona un tipo"
          options={tipos}
          value={form.tipoUbicacionId}
          onChange={e => setForm({ ...form, tipoUbicacionId: e.target.value })}
          name="tipoUbicacionId"
        />
        <SelectOpcion
          label="Área *"
          placeholder="Selecciona un área"
          options={areas}
          value={form.areaId}
          onChange={e => setForm({ ...form, areaId: e.target.value })}
          name="areaId"
        />
        <SelectOpcion
          label="Estado"
          options={ESTADOS}
          value={form.estado}
          onChange={e => setForm({ ...form, estado: e.target.value })}
          name="estado"
        />
      </ModalFormularioSimple>

      {eliminar && (
        <ModalConfirmacion
          mensaje={`¿Eliminar la ubicación "${eliminar.nombre}"?`}
          onConfirmar={confirmarEliminar}
          onCancelar={() => setEliminar(null)}
        />
      )}
    </>
  )
}
