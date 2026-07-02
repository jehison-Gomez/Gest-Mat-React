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
import { categoriasService } from '@/services/categoriasService'
import { useToast } from '@/hooks/useToast'

const VACIO = { nombre: '', descripcion: '', estado: 'activo', nivel: 1, categoriaPadreId: '' }
const ESTADOS = [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }]

export default function CategoriasPage() {
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
      const data = await categoriasService.getAll()
      setLista(Array.isArray(data) ? data : data.data ?? [])
    } catch { toast.error('Error al cargar categorías') }
  }

  const opcionesPadre = lista
    .filter((c) => !editando || c.id !== editando.id)
    .map((c) => ({ value: c.id, label: c.nombre }))

  const abrir = (item = null) => {
    setEditando(item)
    setForm(item ? {
      nombre: item.nombre ?? '',
      descripcion: item.descripcion ?? '',
      estado: item.estado ?? 'activo',
      nivel: item.nivel ?? 1,
      categoriaPadreId: item.categoriaPadre?.id ?? '',
    } : VACIO)
    setModal(true)
  }

  const guardar = async () => {
    setCargando(true)
    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        estado: form.estado,
        nivel: form.categoriaPadreId ? 2 : 1,
        categoriaPadreId: form.categoriaPadreId || undefined,
      }
      editando ? await categoriasService.actualizar(editando.id, payload) : await categoriasService.crear(payload)
      toast.success(editando ? 'Categoría actualizada' : 'Categoría creada')
      setModal(false)
      cargar()
    } catch { toast.error('Error al guardar') }
    finally { setCargando(false) }
  }

  const confirmarEliminar = async () => {
    try { await categoriasService.eliminar(eliminar.id); toast.success('Categoría eliminada'); setEliminar(null); cargar() }
    catch { toast.error('Error al eliminar'); setEliminar(null) }
  }

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 page-title">Categoría de Materiales</h1>
              <p className="text-sm text-gray-500 mt-1">Administra las categorías para clasificar los materiales.</p>
            </div>
            <Boton variante="primario" className="flex items-center gap-2" onClick={() => abrir()}>
              <FiPlus size={16} /> Añadir Categoría
            </Boton>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#39A900]">
                  {['Nombre', 'Categoría Padre', 'Descripción', 'Estado', 'Acciones'].map(c => (
                    <th key={c} className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lista.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Sin categorías registradas</td></tr>
                ) : lista.map(c => (
                  <tr key={c.id} className="hover:bg-[#39A900]/5 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{c.nombre}</td>
                    <td className="px-5 py-4 text-gray-500">{c.categoriaPadre?.nombre ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-600 max-w-xs truncate">{c.descripcion}</td>
                    <td className="px-5 py-4"><Badge variante={c.estado === 'activo' ? 'success' : 'default'}>{c.estado}</Badge></td>
                    <td className="px-5 py-4"><AccionesFila onEditar={() => abrir(c)} onEliminar={() => setEliminar(c)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>

      <ModalFormularioSimple titulo={editando ? 'Editar Categoría' : 'Añadir Categoría'} visible={modal} onGuardar={guardar} onCerrar={() => setModal(false)} cargando={cargando}>
        <InputTexto label="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Equipos" />
        <InputTexto label="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción de la categoría" />
        <SelectOpcion
          label="Categoría Padre (opcional)"
          options={opcionesPadre}
          value={form.categoriaPadreId}
          onChange={e => setForm({ ...form, categoriaPadreId: e.target.value })}
          name="categoriaPadreId"
          placeholder="Ninguna — categoría de nivel 1"
        />
        <SelectOpcion label="Estado" options={ESTADOS} value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} name="estado" />
      </ModalFormularioSimple>

      {eliminar && <ModalConfirmacion mensaje={`¿Eliminar la categoría "${eliminar.nombre}"?`} onConfirmar={confirmarEliminar} onCancelar={() => setEliminar(null)} />}
    </>
  )
}
