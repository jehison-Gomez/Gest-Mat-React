import { useState, useEffect, useMemo } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiMap } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { ModalConfirmacion } from '@/components/molecules/ModalConfirmacion/ModalConfirmacion'
import { Boton } from '@/components/atoms/Boton/Boton'
import { departamentosService } from '@/services/departamentosService'
import { municipiosService } from '@/services/municipiosService'
import { useToast } from '@/hooks/useToast'

/* ─── Mini modal genérico ─── */
function ModalForm({ titulo, campos, form, setForm, onGuardar, onCancelar }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">{titulo}</h2>
        <div className="space-y-3">
          {campos.map(c => (
            <div key={c.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {c.label}{c.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {c.type === 'select' ? (
                <select value={form[c.name] ?? ''}
                  onChange={e => setForm(f => ({ ...f, [c.name]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Seleccionar...</option>
                  {c.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input type="text" value={form[c.name] ?? ''}
                  onChange={e => setForm(f => ({ ...f, [c.name]: e.target.value }))}
                  placeholder={c.placeholder ?? ''}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancelar}
            className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
          <Boton variante="primario" className="flex-1" onClick={onGuardar}>Guardar</Boton>
        </div>
      </div>
    </div>
  )
}

/* ─── Tabla simple ─── */
function TablaSimple({ columnas, filas, onEditar, onEliminar }) {
  if (filas.length === 0)
    return <p className="text-center text-gray-400 py-10 text-sm">No hay registros aún.</p>

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columnas.map(c => (
              <th key={c.key} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {c.label}
              </th>
            ))}
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filas.map(fila => (
            <tr key={fila.id} className="hover:bg-gray-50 transition">
              {columnas.map(c => (
                <td key={c.key} className="px-4 py-3 text-gray-700">{fila[c.key] ?? '—'}</td>
              ))}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onEditar(fila)}
                    className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition">
                    <FiEdit2 size={15} />
                  </button>
                  <button onClick={() => onEliminar(fila)}
                    className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Página principal ─── */
export default function UbicacionesGeoPage() {
  const toast = useToast()
  const [tab, setTab] = useState('departamentos')

  const [departamentos, setDepartamentos] = useState([])
  const [municipios, setMunicipios]       = useState([])
  const [cargando, setCargando]           = useState(false)

  const [modal, setModal]         = useState(null)   // { tipo, form, editando }
  const [aEliminar, setAEliminar] = useState(null)   // { tipo, item }

  useEffect(() => { cargarTodo() }, [])

  const cargarTodo = async () => {
    setCargando(true)
    try {
      const [deps, muns] = await Promise.all([
        departamentosService.getAll(),
        municipiosService.getAll(),
      ])
      setDepartamentos(Array.isArray(deps) ? deps : [])
      setMunicipios(Array.isArray(muns) ? muns : [])
    } catch {
      toast.error('Error al cargar datos')
    } finally {
      setCargando(false)
    }
  }

  /* ── Departamentos ── */
  const abrirCrearDepto = () =>
    setModal({ tipo: 'depto', form: { nombre: '', codigo: '' }, editando: null })

  const abrirEditarDepto = (d) =>
    setModal({ tipo: 'depto', form: { nombre: d.nombre, codigo: d.codigo }, editando: d })

  const guardarDepto = async () => {
    const { form, editando } = modal
    if (!form.nombre?.trim())   { toast.error('El nombre es obligatorio');                    return }
    if (form.nombre.length < 5) { toast.error('El nombre debe tener al menos 5 caracteres'); return }
    if (!form.codigo?.trim())   { toast.error('El código es obligatorio');                    return }
    if (form.codigo.length < 5) { toast.error('El código debe tener al menos 5 caracteres'); return }
    try {
      if (editando) {
        await departamentosService.actualizar(editando.id, form)
        toast.success('Departamento actualizado')
      } else {
        await departamentosService.crear(form)
        toast.success('Departamento creado')
      }
      setModal(null)
      cargarTodo()
    } catch (e) {
      const msg = e?.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Error al guardar')
    }
  }

  /* ── Municipios ── */
  const abrirCrearMun = () =>
    setModal({ tipo: 'mun', form: { nombre: '', codigo: '', departamentoId: '' }, editando: null })

  const abrirEditarMun = (m) =>
    setModal({
      tipo: 'mun',
      form: { nombre: m.nombre, codigo: m.codigo, departamentoId: m.departamento?.id ?? '' },
      editando: m,
    })

  const guardarMun = async () => {
    const { form, editando } = modal
    if (!form.departamentoId)   { toast.error('Selecciona el departamento');                  return }
    if (!form.nombre?.trim())   { toast.error('El nombre es obligatorio');                    return }
    if (form.nombre.length < 5) { toast.error('El nombre debe tener al menos 5 caracteres'); return }
    if (!form.codigo?.trim())   { toast.error('El código es obligatorio');                    return }
    if (form.codigo.length < 5) { toast.error('El código debe tener al menos 5 caracteres'); return }
    try {
      if (editando) {
        await municipiosService.actualizar(editando.id, form)
        toast.success('Municipio actualizado')
      } else {
        await municipiosService.crear(form)
        toast.success('Municipio creado')
      }
      setModal(null)
      cargarTodo()
    } catch (e) {
      const msg = e?.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Error al guardar')
    }
  }

  /* ── Eliminar ── */
  const confirmarEliminar = async () => {
    const { tipo, item } = aEliminar
    try {
      if (tipo === 'depto') await departamentosService.eliminar(item.id)
      else                  await municipiosService.eliminar(item.id)
      toast.success('Eliminado correctamente')
      setAEliminar(null)
      cargarTodo()
    } catch {
      toast.error('Error al eliminar. Puede tener registros asociados.')
      setAEliminar(null)
    }
  }

  /* ── Filas para tablas ── */
  const filasDepto = useMemo(() =>
    departamentos.map(d => ({ ...d, estadoLabel: d.estado === 'activo' ? '✅ Activo' : '⚪ Inactivo' })),
  [departamentos])

  const filasMun = useMemo(() =>
    municipios.map(m => ({
      ...m,
      departamentoNombre: m.departamento?.nombre ?? '—',
      estadoLabel: m.estado === 'activo' ? '✅ Activo' : '⚪ Inactivo',
    })),
  [municipios])

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 page-title">Ubicaciones Geográficas</h1>
            <p className="text-sm text-gray-500 mt-1">Administra departamentos y municipios del país.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            {[
              { key: 'departamentos', label: 'Departamentos', icono: FiMap },
              { key: 'municipios',    label: 'Municipios',    icono: FiMapPin },
            ].map(({ key, label, icono: Icono }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  tab === key
                    ? 'bg-white text-[#39A900] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                <Icono size={15} /> {label}
              </button>
            ))}
          </div>

          {cargando ? (
            <p className="text-gray-400 text-sm">Cargando...</p>
          ) : tab === 'departamentos' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{departamentos.length} departamento(s) registrado(s)</p>
                <Boton variante="primario" className="flex items-center gap-2" onClick={abrirCrearDepto}>
                  <FiPlus size={15} /> Nuevo Departamento
                </Boton>
              </div>
              <TablaSimple
                columnas={[
                  { key: 'nombre', label: 'Nombre' },
                  { key: 'codigo', label: 'Código' },
                  { key: 'estadoLabel', label: 'Estado' },
                ]}
                filas={filasDepto}
                onEditar={abrirEditarDepto}
                onEliminar={d => setAEliminar({ tipo: 'depto', item: d })}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{municipios.length} municipio(s) registrado(s)</p>
                <Boton variante="primario" className="flex items-center gap-2" onClick={abrirCrearMun}>
                  <FiPlus size={15} /> Nuevo Municipio
                </Boton>
              </div>
              <TablaSimple
                columnas={[
                  { key: 'nombre',              label: 'Municipio'     },
                  { key: 'codigo',              label: 'Código'        },
                  { key: 'departamentoNombre',  label: 'Departamento'  },
                  { key: 'estadoLabel',         label: 'Estado'        },
                ]}
                filas={filasMun}
                onEditar={abrirEditarMun}
                onEliminar={m => setAEliminar({ tipo: 'mun', item: m })}
              />
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Modal departamento */}
      {modal?.tipo === 'depto' && (
        <ModalForm
          titulo={modal.editando ? 'Editar Departamento' : 'Nuevo Departamento'}
          form={modal.form}
          setForm={f => setModal(m => ({ ...m, form: typeof f === 'function' ? f(m.form) : f }))}
          onGuardar={guardarDepto}
          onCancelar={() => setModal(null)}
          campos={[
            { name: 'nombre', label: 'Nombre',  required: true, placeholder: 'Ej: Huila' },
            { name: 'codigo', label: 'Código',  required: true, placeholder: 'Ej: HUILA-01' },
          ]}
        />
      )}

      {/* Modal municipio */}
      {modal?.tipo === 'mun' && (
        <ModalForm
          titulo={modal.editando ? 'Editar Municipio' : 'Nuevo Municipio'}
          form={modal.form}
          setForm={f => setModal(m => ({ ...m, form: typeof f === 'function' ? f(m.form) : f }))}
          onGuardar={guardarMun}
          onCancelar={() => setModal(null)}
          campos={[
            {
              name: 'departamentoId', label: 'Departamento', required: true,
              type: 'select',
              options: departamentos.map(d => ({ value: d.id, label: d.nombre })),
            },
            { name: 'nombre', label: 'Nombre del municipio', required: true, placeholder: 'Ej: Neiva' },
            { name: 'codigo', label: 'Código',               required: true, placeholder: 'Ej: NEIVA-01' },
          ]}
        />
      )}

      {aEliminar && (
        <ModalConfirmacion
          mensaje={`¿Eliminar "${aEliminar.item.nombre}"? ${
            aEliminar.tipo === 'depto'
              ? 'Esto eliminará también sus municipios.'
              : 'Esto puede afectar centros asociados.'
          }`}
          onConfirmar={confirmarEliminar}
          onCancelar={() => setAEliminar(null)}
        />
      )}
    </>
  )
}
