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
import { tiposUbicacionService } from '@/services/tiposUbicacionService'
import { useToast } from '@/hooks/useToast'

const VACIO = { nombre: '', descripcion: '', estado: 'activo' }
const ESTADOS = [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }]

export default function TiposUbicacionPage() {
  const toast = useToast()
  const [lista, setLista] = useState([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [cargando, setCargando] = useState(false)
  const [eliminar, setEliminar] = useState(null)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const data = await tiposUbicacionService.getAll()
      setLista(Array.isArray(data) ? data : data.data ?? [])
    } catch { toast.error('Error al cargar tipos de ubicación') }
  }

  const abrir = (item = null) => {
    setEditando(item)
    setForm(item ? { nombre: item.nombre ?? '', descripcion: item.descripcion ?? '', estado: item.estado ?? 'activo' } : VACIO)
    setModal(true)
  }

  const guardar = async () => {
    setCargando(true)
    try {
      editando ? await tiposUbicacionService.actualizar(editando.id, form) : await tiposUbicacionService.crear(form)
      toast.success(editando ? 'Tipo actualizado' : 'Tipo creado')
      setModal(false)
      cargar()
    } catch { toast.error('Error al guardar') }
    finally { setCargando(false) }
  }

  const confirmarEliminar = async () => {
    try { await tiposUbicacionService.eliminar(eliminar.id); toast.success('Tipo eliminado'); setEliminar(null); cargar() }
    catch { toast.error('Error al eliminar'); setEliminar(null) }
  }

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 page-title">Tipos de Ubicación</h1>
              <p className="text-sm text-gray-500 mt-1">Administra los tipos de ubicación disponibles para las áreas.</p>
            </div>
            <Boton variante="primario" className="flex items-center gap-2" onClick={() => abrir()}>
              <FiPlus size={16} /> Añadir Tipo
            </Boton>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#39A900]">
                  {['Nombre', 'Descripción', 'Estado', 'Acciones'].map(c => (
                    <th key={c} className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lista.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">Sin tipos de ubicación registrados</td></tr>
                ) : lista.map(t => (
                  <tr key={t.id} className="hover:bg-[#39A900]/5 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{t.nombre}</td>
                    <td className="px-5 py-4 text-gray-600 max-w-xs truncate">{t.descripcion}</td>
                    <td className="px-5 py-4"><Badge variante={t.estado === 'activo' ? 'success' : 'default'}>{t.estado}</Badge></td>
                    <td className="px-5 py-4"><AccionesFila onEditar={() => abrir(t)} onEliminar={() => setEliminar(t)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>

      <ModalFormularioSimple titulo={editando ? 'Editar Tipo de Ubicación' : 'Añadir Tipo de Ubicación'} visible={modal} onGuardar={guardar} onCerrar={() => setModal(false)} cargando={cargando}>
        <InputTexto label="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Bodega" />
        <InputTexto label="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción del tipo" />
        <SelectOpcion label="Estado" options={ESTADOS} value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} name="estado" />
      </ModalFormularioSimple>

      {eliminar && <ModalConfirmacion mensaje={`¿Eliminar el tipo "${eliminar.nombre}"?`} onConfirmar={confirmarEliminar} onCancelar={() => setEliminar(null)} />}
    </>
  )
}
