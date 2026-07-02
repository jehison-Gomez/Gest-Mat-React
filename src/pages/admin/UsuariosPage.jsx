import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiFilter } from 'react-icons/fi'
import { DashboardLayout } from '@/components/templates/DashboardLayout/DashboardLayout'
import { TablaUsuarios } from '@/components/organisms/TablaUsuarios/TablaUsuarios'
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar'
import { SelectOpcion } from '@/components/atoms/SelectOpcion/SelectOpcion'
import { Boton } from '@/components/atoms/Boton/Boton'
import { usuariosService } from '@/services/usuariosService'
import { rolesService } from '@/services/rolesService'
import { areasService } from '@/services/areasService'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'

const POR_PAGINA = 10

const ESTADO_OPCIONES = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
]

export default function UsuariosPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { isSuperAdmin } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [rolesOpciones, setRolesOpciones] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    cargarTodo()
  }, [])

  const cargarTodo = async () => {
    try {
      const [usuariosData, areasData, rolesData] = await Promise.all([
        usuariosService.getAll(),
        areasService.getAll(),
        rolesService.getAll(),
      ])

      const arrAreas = Array.isArray(areasData) ? areasData : areasData.data ?? []
      const arrRoles = Array.isArray(rolesData) ? rolesData : rolesData.data ?? []

      // Mapa userId → nombre del área
      const areaPorUsuario = {}
      arrAreas.forEach(a => {
        if (a.usuarioLider?.id) areaPorUsuario[a.usuarioLider.id] = a.nombre
      })

      setRolesOpciones(arrRoles.map(r => ({ value: r.nombre, label: r.nombre })))

      const lista = (Array.isArray(usuariosData) ? usuariosData : usuariosData.usuarios ?? usuariosData.data ?? []).map((u) => {
        const rolNombre = u.role?.nombre ?? u.rol ?? '—'
        const sedeName  = u.sede?.nombre ?? null
        const rolLabel  = rolNombre === 'administrador' && sedeName
          ? `Administrador de ${sedeName}`
          : rolNombre
        return {
          id: u.id,
          nombre: u.nombre ?? '—',
          correo: u.correo ?? '—',
          rol: rolNombre,
          rolLabel,
          area: areaPorUsuario[u.id] ?? '—',
          ultimoAcceso: u.ultimo_acceso ?? u.ultimoAcceso ?? '—',
          activo: u.estado === true || u.estado === 'activo' || u.estado === 1,
        }
      })
      setUsuarios(lista)
    } catch {
      toast.error('Error al cargar los usuarios')
    }
  }

  const cargarUsuarios = () => cargarTodo()

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return usuarios.filter((u) => {
      const coincideBusqueda =
        u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q)
      const coincideRol = !filtroRol || u.rol === filtroRol
      const coincideEstado =
        !filtroEstado ||
        (filtroEstado === 'activo' ? u.activo : !u.activo)
      return coincideBusqueda && coincideRol && coincideEstado
    })
  }, [usuarios, busqueda, filtroRol, filtroEstado])

  const paginados = useMemo(() => {
    const inicio = (pagina - 1) * POR_PAGINA
    return filtrados.slice(inicio, inicio + POR_PAGINA)
  }, [filtrados, pagina])

  const handleBusqueda = (valor) => { setBusqueda(valor); setPagina(1) }

  const handleToggleEstado = async (usuario, nuevoActivo) => {
    try {
      await usuariosService.actualizar(usuario.id, { estado: nuevoActivo ? 'activo' : 'inactivo' })
      toast.success(`Usuario ${nuevoActivo ? 'activado' : 'desactivado'} correctamente`)
      cargarUsuarios()
    } catch (e) {
      toast.error(e?.response?.data?.message ?? 'Error al cambiar el estado')
    }
  }

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Título */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 page-title">Gestión de Usuarios</h1>
            <p className="text-sm text-gray-500 mt-1">
              Administra los accesos, roles y perfiles del sistema
            </p>
          </div>

          {/* Toolbar */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="flex-1 min-w-48">
              <SearchBar
                placeholder="Buscar..."
                value={busqueda}
                onChange={handleBusqueda}
              />
            </div>
            <div className="w-full sm:w-44">
              <SelectOpcion
                placeholder="Todos los Roles"
                options={rolesOpciones}
                value={filtroRol}
                onChange={(e) => { setFiltroRol(e.target.value); setPagina(1) }}
                name="filtroRol"
              />
            </div>
            <div className="w-full sm:w-44">
              <SelectOpcion
                placeholder="Cualquier Estado"
                options={ESTADO_OPCIONES}
                value={filtroEstado}
                onChange={(e) => { setFiltroEstado(e.target.value); setPagina(1) }}
                name="filtroEstado"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-[#39A900]/5 transition-colors">
              <FiFilter size={15} />
              Más Filtros
            </button>
            <Boton
              variante="primario"
              className="flex items-center gap-2 whitespace-nowrap"
              onClick={() => navigate('/app/usuarios/nuevo')}
            >
              <FiPlus size={16} />
              Nuevo Usuario
            </Boton>
          </div>

          {/* Tabla */}
          <TablaUsuarios
            usuarios={paginados}
            totalRegistros={filtrados.length}
            paginaActual={pagina}
            porPagina={POR_PAGINA}
            onAnterior={() => setPagina((p) => p - 1)}
            onSiguiente={() => setPagina((p) => p + 1)}
            onEditar={(u) => navigate(`/app/usuarios/editar/${u.id}`)}
            mostrarArea={!isSuperAdmin}
            onToggleEstado={handleToggleEstado}
          />
        </div>
      </DashboardLayout>

    </>
  )
}
