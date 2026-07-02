import { useState, useEffect } from 'react'
import { FiPlus } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { ModalFormularioSimple } from '@/components/organisms/ModalFormularioSimple/ModalFormularioSimple'
import { ModalConfirmacion } from '@/components/molecules/ModalConfirmacion/ModalConfirmacion'
import { Badge } from '@/components/atoms/Badge/Badge'
import { Boton } from '@/components/atoms/Boton/Boton'
import { InputTexto } from '@/components/atoms/InputTexto/InputTexto'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { AccionesFila } from '@/components/molecules/AccionesFila/AccionesFila'
import { programasService } from '@/services/programasService'
import { areasService } from '@/services/areasService'
import { useToast } from '@/hooks/useToast'

const VACIO = { nombre: '', codigo: '', nivelFormacion: '', areaId: '', estado: 'activo' }

const NIVELES = [
  { value: 'tecnico', label: 'Técnico' },
  { value: 'tecnologo', label: 'Tecnólogo' },
]

const ESTADOS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
]

export default function ProgramasPage() {
  const toast = useToast()
  const [lista, setLista] = useState([])
  const [areas, setAreas] = useState([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [eliminar, setEliminar] = useState(null)

  useEffect(() => { cargar(); cargarAreas() }, [])

  const cargar = async () => {
    try {
      const data = await programasService.getAll()
      setLista(Array.isArray(data) ? data : data.data ?? [])
    } catch { toast.error('Error al cargar programas') }
  }

  const cargarAreas = async () => {
    try {
      const data = await areasService.getAll()
      const arr = Array.isArray(data) ? data : data.data ?? []
      setAreas(arr.map(a => ({ value: a.id, label: a.nombre })))
    } catch { toast.error('Error al cargar áreas') }
  }

  const abrir = (item = null) => {
    setEditando(item)
    setForm(item ? {
      nombre: item.nombre ?? '',
      codigo: item.codigo ?? '',
      nivelFormacion: item.nivelFormacion ?? '',
      areaId: item.area?.id ?? item.areaId ?? '',
      estado: item.estado ?? 'activo',
    } : VACIO)
    setError('')
    setModal(true)
  }

  const guardar = async () => {
    if (!form.nombre || form.nombre.trim().length < 5) return setError('El nombre debe tener al menos 5 caracteres.')
    if (!form.codigo || form.codigo.trim().length < 5) return setError('El código debe tener al menos 5 caracteres.')
    if (!form.nivelFormacion) return setError('Selecciona un nivel de formación.')
    if (!form.areaId) return setError('Selecciona un área.')
    setCargando(true)
    try {
      const datos = {
        nombre: form.nombre.trim(),
        codigo: form.codigo.trim(),
        nivelFormacion: form.nivelFormacion,
        areaId: form.areaId,
        estado: form.estado,
      }
      editando
        ? await programasService.actualizar(editando.id, datos)
        : await programasService.crear(datos)
      toast.success(editando ? 'Programa actualizado' : 'Programa creado')
      setModal(false)
      cargar()
    } catch (e) {
      const msg = e?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(' | ') : msg || 'Error al guardar el programa.')
    } finally { setCargando(false) }
  }

  const confirmarEliminar = async () => {
    try { await programasService.eliminar(eliminar.id); toast.success('Programa eliminado'); setEliminar(null); cargar() }
    catch { toast.error('Error al eliminar el programa'); setEliminar(null) }
  }

  const nivelLabel = (val) => NIVELES.find(n => n.value === val)?.label ?? val ?? '—'

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 page-title">Programas</h1>
              <p className="text-sm text-gray-500 mt-1">Gestiona los programas de formación del sistema.</p>
            </div>
            <Boton variante="primario" className="flex items-center gap-2" onClick={() => abrir()}>
              <FiPlus size={16} /> Añadir Programa
            </Boton>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#39A900]">
                  {['Código', 'Nombre', 'Nivel de Formación', 'Área', 'Estado', 'Acciones'].map(c => (
                    <th key={c} className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lista.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Sin programas registrados</td></tr>
                ) : lista.map(p => (
                  <tr key={p.id} className="hover:bg-[#39A900]/5 transition-colors">
                    <td className="px-5 py-4 font-mono text-sm text-gray-600">{p.codigo}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">{p.nombre}</td>
                    <td className="px-5 py-4 text-gray-600">{nivelLabel(p.nivelFormacion)}</td>
                    <td className="px-5 py-4 text-gray-600">{p.area?.nombre ?? '—'}</td>
                    <td className="px-5 py-4">
                      <Badge variante={p.estado === 'activo' ? 'success' : 'default'}>{p.estado}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <AccionesFila onEditar={() => abrir(p)} onEliminar={() => setEliminar(p)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>

      <ModalFormularioSimple
        titulo={editando ? 'Editar Programa' : 'Añadir Programa'}
        visible={modal}
        onGuardar={guardar}
        onCerrar={() => setModal(false)}
        error={error}
        cargando={cargando}
      >
        <InputTexto label="Nombre *" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Análisis y Desarrollo de Software" />
        <InputTexto label="Código *" value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} placeholder="Ej: 228118" />
        <SelectOpcion label="Nivel de Formación *" placeholder="Selecciona un nivel" options={NIVELES} value={form.nivelFormacion} onChange={e => setForm({ ...form, nivelFormacion: e.target.value })} name="nivelFormacion" />
        <SelectOpcion label="Área *" placeholder="Selecciona un área" options={areas} value={form.areaId} onChange={e => setForm({ ...form, areaId: e.target.value })} name="areaId" />
        <SelectOpcion label="Estado" options={ESTADOS} value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} name="estado" />
      </ModalFormularioSimple>

      {eliminar && <ModalConfirmacion mensaje={`¿Eliminar el programa "${eliminar.nombre}"?`} onConfirmar={confirmarEliminar} onCancelar={() => setEliminar(null)} />}
    </>
  )
}
