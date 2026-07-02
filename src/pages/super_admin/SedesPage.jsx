import { useState, useEffect, useMemo } from 'react'
import { FiPlus, FiEdit2, FiBriefcase } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar'
import { Boton } from '@/components/atoms/Boton/Boton'
import { sedesService } from '@/services/sedesService'
import { centrosService } from '@/services/centrosService'
import { useToast } from '@/hooks/useToast'

const FORM_VACIO = { nombre: '', direccion: '', centroId: '', estado: 'activo' }

export default function SedesPage() {
  const toast = useToast()
  const [sedes, setSedes] = useState([])
  const [centros, setCentros] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(false)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)

  useEffect(() => {
    cargar()
    centrosService.getAll()
      .then(data => setCentros(Array.isArray(data) ? data : data.data ?? []))
      .catch(() => {})
  }, [])

  const cargar = async () => {
    setCargando(true)
    try {
      const data = await sedesService.getAll()
      setSedes(Array.isArray(data) ? data : data.data ?? [])
    } catch {
      toast.error('Error al cargar las sedes')
    } finally {
      setCargando(false)
    }
  }

  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase()
    return sedes.filter(s =>
      s.nombre?.toLowerCase().includes(q) ||
      s.direccion?.toLowerCase().includes(q) ||
      s.centro?.nombre?.toLowerCase().includes(q)
    )
  }, [sedes, busqueda])

  const abrirCrear = () => {
    setEditando(null)
    setForm(FORM_VACIO)
    setModalAbierto(true)
  }

  const abrirEditar = (sede) => {
    setEditando(sede)
    setForm({
      nombre:    sede.nombre ?? '',
      direccion: sede.direccion ?? '',
      centroId:  sede.centro?.id ?? '',
      estado:    sede.estado ?? 'activo',
    })
    setModalAbierto(true)
  }

  const guardar = async () => {
    if (!form.nombre.trim()) { toast.error('El nombre es obligatorio'); return }
    if (!form.centroId)      { toast.error('Selecciona un centro');    return }
    try {
      const payload = { nombre: form.nombre.trim(), direccion: form.direccion.trim(), centroId: form.centroId, estado: form.estado }
      if (editando) {
        await sedesService.actualizar(editando.id, payload)
        toast.success('Sede actualizada')
      } else {
        await sedesService.crear(payload)
        toast.success('Sede creada')
      }
      setModalAbierto(false)
      cargar()
    } catch (e) {
      toast.error(e?.response?.data?.message ?? 'Error al guardar')
    }
  }

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 page-title">Sedes</h1>
              <p className="text-sm text-gray-500 mt-1">Administra las sedes de cada centro de formación.</p>
            </div>
            <Boton variante="primario" className="flex items-center gap-2" onClick={abrirCrear}>
              <FiPlus size={16} /> Nueva Sede
            </Boton>
          </div>

          <SearchBar
            placeholder="Buscar por nombre, dirección o centro..."
            value={busqueda}
            onChange={(v) => setBusqueda(v)}
          />

          {cargando ? (
            <p className="text-gray-400 text-sm">Cargando...</p>
          ) : filtradas.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FiBriefcase size={40} className="mx-auto mb-3 opacity-40" />
              <p>No hay sedes registradas aún.</p>
              <p className="text-sm mt-1">Haz clic en "Nueva Sede" para crear la primera.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtradas.map(s => (
                <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 text-blue-700 rounded-lg p-2">
                        <FiBriefcase size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{s.nombre}</p>
                        {s.centro && (
                          <p className="text-xs text-gray-400">{s.centro.nombre}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      s.estado === 'activo' ? 'bg-green-100 text-[#39A900]' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {s.estado === 'activo' ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  {s.direccion && (
                    <p className="text-xs text-gray-500 mb-4 line-clamp-1">{s.direccion}</p>
                  )}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => abrirEditar(s)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-800 py-1"
                    >
                      <FiEdit2 size={13} /> Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editando ? 'Editar Sede' : 'Nueva Sede'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Centro <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.centroId}
                  onChange={e => setForm(f => ({ ...f, centroId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecciona un centro...</option>
                  {centros.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={form.estado}
                  onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="activo">Activa</option>
                  <option value="inactivo">Inactiva</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalAbierto(false)}
                className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <Boton variante="primario" className="flex-1" onClick={guardar}>
                {editando ? 'Guardar cambios' : 'Crear sede'}
              </Boton>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
