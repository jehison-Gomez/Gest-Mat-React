import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiUsers, FiRepeat } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar'
import { Badge } from '@/components/atoms/Badge/Badge'
import { Boton } from '@/components/atoms/Boton/Boton'
import { fichasService } from '@/services/fichasService'
import { useToast } from '@/hooks/useToast'

export default function MisFichasPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [fichas, setFichas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [aprendicesModal, setAprendicesModal] = useState(null)
  const [aprendices, setAprendices] = useState([])

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await fichasService.getMias()
        const lista = (Array.isArray(data) ? data : data.data ?? []).map((f) => ({
          id: f.id,
          codigo: f.codigo ?? f.codigoFicha ?? '—',
          programa: f.programa?.nombre ?? f.programa ?? '—',
          estado: f.estado ?? 'activo',
        }))
        setFichas(lista)
      } catch {
        toast.error('Error al cargar las fichas')
      }
    }
    cargar()
  }, [])

  const verAprendices = async (ficha) => {
    try {
      const data = await fichasService.getAprendices(ficha.id)
      const lista = (Array.isArray(data) ? data : data.data ?? [])
      setAprendices(lista)
      setAprendicesModal(ficha)
    } catch {
      toast.error('Error al cargar aprendices')
    }
  }

  const filtradas = fichas.filter((f) =>
    f.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.programa.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 page-title">Mis Fichas</h1>
            <p className="text-sm text-gray-500 mt-1">Fichas de formación asignadas a tu cargo.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar placeholder="Buscar ficha o programa..." value={busqueda} onChange={setBusqueda} />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#39A900]">
                    {['Código Ficha', 'Programa', 'Estado', 'Acciones'].map((col) => (
                      <th key={col} className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtradas.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">No tienes fichas asignadas</td></tr>
                  ) : (
                    filtradas.map((f) => (
                      <tr key={f.id} className="hover:bg-[#39A900]/5 transition-colors">
                        <td className="px-5 py-4 font-mono font-medium text-gray-900">{f.codigo}</td>
                        <td className="px-5 py-4 text-gray-700">{f.programa}</td>
                        <td className="px-5 py-4">
                          <Badge variante={f.estado === 'activo' ? 'success' : 'default'} >{f.estado}</Badge>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => verAprendices(f)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                              <FiUsers size={13} /> Aprendices
                            </button>
                            <button onClick={() => navigate(`/app/mis-prestamos/nuevo?fichaId=${f.id}`)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#39A900] hover:bg-[#39A900] text-white rounded-lg transition-colors">
                              <FiPlus size={13} /> Préstamo
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* Modal aprendices */}
      {aprendicesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAprendicesModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Aprendices — Ficha {aprendicesModal.codigo}</h3>
            {aprendices.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sin aprendices registrados</p>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {aprendices.map((a, i) => (
                  <li key={i} className="py-2.5">
                    <p className="text-sm font-medium text-gray-900">{a.nombre ?? '—'}</p>
                    <p className="text-xs text-gray-500">{a.correo ?? a.documento ?? '—'}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end">
              <Boton variante="secundario" onClick={() => setAprendicesModal(null)}>Cerrar</Boton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
