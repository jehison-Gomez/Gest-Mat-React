import { useState, useEffect, useMemo } from 'react'
import { FiPlus, FiEdit2, FiMapPin } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar'
import { Boton } from '@/components/atoms/Boton/Boton'
import { centrosService } from '@/services/centrosService'
import { useToast } from '@/hooks/useToast'
import api from '@/services/api'

const FORM_VACIO = {
  nombre:        '',
  codigo:        '',
  direccion:     '',
  departamentoId:'',
  municipioId:   '',
}

export default function CentrosPage() {
  const toast = useToast()
  const [centros, setCentros]           = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [municipios, setMunicipios]     = useState([])
  const [busqueda, setBusqueda]         = useState('')
  const [cargando, setCargando]         = useState(false)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando]         = useState(null)
  const [form, setForm]                 = useState(FORM_VACIO)

  useEffect(() => {
    cargar()
    api.get('/api/departamentos').then(r => setDepartamentos(r.data ?? [])).catch(() => {})
    api.get('/api/municipios').then(r => setMunicipios(r.data ?? [])).catch(() => {})
  }, [])

  const municipiosFiltrados = useMemo(() => {
    if (!form.departamentoId) return []
    return municipios.filter(m => m.departamento?.id === form.departamentoId)
  }, [municipios, form.departamentoId])

  const cargar = async () => {
    setCargando(true)
    try {
      const data = await centrosService.getAll()
      setCentros(Array.isArray(data) ? data : data.data ?? [])
    } catch {
      toast.error('Error al cargar los centros')
    } finally {
      setCargando(false)
    }
  }

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return centros.filter(c =>
      c.nombre?.toLowerCase().includes(q) ||
      c.codigo?.toLowerCase().includes(q) ||
      c.direccion?.toLowerCase().includes(q)
    )
  }, [centros, busqueda])

  const setField = (name, value) => {
    setForm(f => {
      const next = { ...f, [name]: value }
      // Al cambiar departamento, resetear municipio
      if (name === 'departamentoId') next.municipioId = ''
      return next
    })
  }

  const abrirCrear = () => {
    setEditando(null)
    setForm(FORM_VACIO)
    setModalAbierto(true)
  }

  const abrirEditar = (centro) => {
    setEditando(centro)
    setForm({
      nombre:         centro.nombre       ?? '',
      codigo:         centro.codigo       ?? '',
      direccion:      centro.direccion    ?? '',
      departamentoId: centro.municipio?.departamento?.id ?? '',
      municipioId:    centro.municipio?.id ?? '',
    })
    setModalAbierto(true)
  }

  const guardar = async () => {
    if (!form.departamentoId)  { toast.error('Selecciona el departamento');                    return }
    if (!form.municipioId)     { toast.error('Selecciona la ciudad/municipio');                return }
    if (!form.nombre.trim())   { toast.error('El nombre del centro es obligatorio');           return }
    if (form.nombre.length < 5){ toast.error('El nombre debe tener al menos 5 caracteres');   return }
    if (!form.codigo.trim())   { toast.error('El código es obligatorio');                      return }
    if (form.codigo.length < 4){ toast.error('El código debe tener al menos 4 caracteres');   return }
    if (!form.direccion.trim()){ toast.error('La dirección es obligatoria');                   return }

    const payload = {
      nombre:      form.nombre,
      codigo:      form.codigo,
      direccion:   form.direccion,
      municipioId: form.municipioId,
    }

    try {
      if (editando) {
        await centrosService.actualizar(editando.id, payload)
        toast.success('Centro actualizado')
      } else {
        await centrosService.crear(payload)
        toast.success('Centro creado exitosamente')
      }
      setModalAbierto(false)
      cargar()
    } catch (e) {
      const msg = e?.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Error al guardar')
    }
  }

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 page-title">Centros de Formación</h1>
              <p className="text-sm text-gray-500 mt-1">Administra los centros de formación del SENA.</p>
            </div>
            <Boton variante="primario" className="flex items-center gap-2" onClick={abrirCrear}>
              <FiPlus size={16} /> Nuevo Centro
            </Boton>
          </div>

          <SearchBar
            placeholder="Buscar por nombre, código o dirección..."
            value={busqueda}
            onChange={setBusqueda}
          />

          {cargando ? (
            <p className="text-gray-400 text-sm">Cargando...</p>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FiMapPin size={40} className="mx-auto mb-3 opacity-40" />
              <p>No hay centros registrados aún.</p>
              <p className="text-sm mt-1">Haz clic en "Nuevo Centro" para crear el primero.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtrados.map(c => (
                <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 text-[#39A900] rounded-lg p-2">
                        <FiMapPin size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{c.nombre}</p>
                        <p className="text-xs text-gray-400">{c.codigo}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      c.estado === 'activo' ? 'bg-green-100 text-[#39A900]' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {c.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 space-y-0.5 mb-3 pl-1">
                    {c.municipio && (
                      <p>📍 {c.municipio.nombre}{c.municipio.departamento ? `, ${c.municipio.departamento.nombre}` : ''}</p>
                    )}
                    {c.direccion && <p>🏠 {c.direccion}</p>}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button onClick={() => abrirEditar(c)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-800 py-1">
                      <FiEdit2 size={13} /> Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Modal crear / editar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              {editando ? 'Editar Centro' : 'Nuevo Centro de Formación'}
            </h2>
            <p className="text-xs text-gray-400 mb-5">Completa la ubicación y los datos del centro.</p>

            {/* Sección ubicación */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ubicación</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento <span className="text-red-500">*</span>
                </label>
                <select value={form.departamentoId}
                  onChange={e => setField('departamentoId', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Seleccionar...</option>
                  {departamentos.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad / Municipio <span className="text-red-500">*</span>
                </label>
                <select value={form.municipioId}
                  onChange={e => setField('municipioId', e.target.value)}
                  disabled={!form.departamentoId}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-400">
                  <option value="">
                    {form.departamentoId ? 'Seleccionar...' : 'Primero elige departamento'}
                  </option>
                  {municipiosFiltrados.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.direccion}
                onChange={e => setField('direccion', e.target.value)}
                placeholder="Ej: Av. 5 # 12-34, Barrio Norte"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            {/* Sección datos del centro */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Datos del Centro</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.nombre}
                  onChange={e => setField('nombre', e.target.value)}
                  placeholder="Mín. 5 caracteres"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.codigo}
                  onChange={e => setField('codigo', e.target.value)}
                  placeholder="Ej: 9520"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setModalAbierto(false)}
                className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <Boton variante="primario" className="flex-1" onClick={guardar}>
                {editando ? 'Guardar cambios' : 'Crear Centro'}
              </Boton>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
