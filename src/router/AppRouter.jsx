import { Routes, Route } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { ROLES } from '@/hooks/useAuth'

import LoginPage from '@/pages/LoginPage'

// Admin
import DashboardPage       from '@/pages/admin/DashboardPage'
import MaterialesPage      from '@/pages/admin/MaterialesPage'
import NuevoMaterialPage   from '@/pages/admin/NuevoMaterialPage'
import EditarMaterialPage  from '@/pages/admin/EditarMaterialPage'
import AreasPage           from '@/pages/admin/AreasPage'
import NuevaAreaPage       from '@/pages/admin/NuevaAreaPage'
import EditarAreaPage      from '@/pages/admin/EditarAreaPage'
import UsuariosPage        from '@/pages/admin/UsuariosPage'
import NuevoUsuarioPage    from '@/pages/admin/NuevoUsuarioPage'
import EditarUsuarioPage   from '@/pages/admin/EditarUsuarioPage'
import ReportesPage        from '@/pages/admin/ReportesPage'
import RolesPage           from '@/pages/admin/RolesPage'
import PermisosPage        from '@/pages/admin/PermisosPage'
import CategoriasPage      from '@/pages/admin/CategoriasPage'
import TiposUbicacionPage  from '@/pages/admin/TiposUbicacionPage'
import UbicacionesPage     from '@/pages/admin/UbicacionesPage'
import ProgramasPage       from '@/pages/admin/ProgramasPage'
import FichasPage          from '@/pages/admin/FichasPage'
import MovimientosPage     from '@/pages/admin/MovimientosPage'
import KardexPage          from '@/pages/admin/KardexPage'

// Shared
import GestionPrestamosPage from '@/pages/shared/GestionPrestamosPage'
import NuevoPrestamoPage    from '@/pages/shared/NuevoPrestamoPage'
import MiPerfilPage         from '@/pages/shared/MiPerfilPage'
import MiBodegaPage         from '@/pages/shared/MiBodegaPage'

// Instructor Encargado
import GestionAreaPage from '@/pages/instructor_encargado/GestionAreaPage'

// Instructor
import MisFichasPage    from '@/pages/instructor/MisFichasPage'
import MisPrestamosPage from '@/pages/instructor/MisPrestamosPage'

// Aprendiz / Vocero
import MisAsignacionesPage from '@/pages/aprendiz/MisAsignacionesPage'

// Super Admin
import CentrosPage        from '@/pages/super_admin/CentrosPage'
import SedesPage          from '@/pages/super_admin/SedesPage'
import UbicacionesGeoPage from '@/pages/super_admin/UbicacionesGeoPage'

const SUPER_ADMIN       = [ROLES.SUPER_ADMIN]
const ADMIN             = [ROLES.ADMINISTRADOR]
const ADMIN_O_SA        = [ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN]
const ADMIN_ENC     = [ROLES.ADMINISTRADOR, ROLES.INSTRUCTOR_ENCARGADO]
const ADMIN_ENC_INST= [ROLES.ADMINISTRADOR, ROLES.INSTRUCTOR_ENCARGADO, ROLES.INSTRUCTOR]
const TODOS         = [ROLES.SUPER_ADMIN, ROLES.ADMINISTRADOR, ROLES.INSTRUCTOR_ENCARGADO, ROLES.INSTRUCTOR, ROLES.VOCERO, ROLES.APRENDIZ]
const PUEDEN_PEDIR  = [ROLES.ADMINISTRADOR, ROLES.INSTRUCTOR_ENCARGADO, ROLES.INSTRUCTOR, ROLES.VOCERO, ROLES.APRENDIZ]

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route path="/app">

        {/* Super Admin — centros y sedes */}
        <Route element={<PrivateRoute allowedRoles={SUPER_ADMIN} permisoRequerido="centros:leer" />}>
          <Route path="centros" element={<CentrosPage />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={SUPER_ADMIN} permisoRequerido="sedes:leer" />}>
          <Route path="sedes" element={<SedesPage />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={SUPER_ADMIN} />}>
          <Route path="ubicaciones-geo" element={<UbicacionesGeoPage />} />
        </Route>

        {/* Dashboard — roles base + cualquiera con dashboard:leer */}
        <Route element={<PrivateRoute allowedRoles={ADMIN_ENC_INST} permisoRequerido="dashboard:leer" />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>

        {/* Áreas */}
        <Route element={<PrivateRoute allowedRoles={ADMIN} permisoRequerido="areas:leer" />}>
          <Route path="areas" element={<AreasPage />} />
          <Route path="areas/nueva" element={<NuevaAreaPage />} />
          <Route path="areas/editar/:id" element={<EditarAreaPage />} />
        </Route>

        {/* Usuarios — admin y super_admin */}
        <Route element={<PrivateRoute allowedRoles={ADMIN_O_SA} permisoRequerido="usuarios:leer" />}>
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="usuarios/nuevo" element={<NuevoUsuarioPage />} />
          <Route path="usuarios/editar/:id" element={<EditarUsuarioPage />} />
        </Route>

        {/* Roles */}
        <Route element={<PrivateRoute allowedRoles={ADMIN} permisoRequerido="roles:leer" />}>
          <Route path="roles" element={<RolesPage />} />
        </Route>

        {/* Configuración: permisos, categorías, tipos de ubicación */}
        <Route element={<PrivateRoute allowedRoles={ADMIN} permisoRequerido="configuracion:leer" />}>
          <Route path="permisos" element={<PermisosPage />} />
          <Route path="categorias" element={<CategoriasPage />} />
          <Route path="tipos-ubicacion" element={<TiposUbicacionPage />} />
        </Route>

        {/* Ubicaciones */}
        <Route element={<PrivateRoute allowedRoles={ADMIN_ENC} permisoRequerido="ubicaciones:leer" />}>
          <Route path="ubicaciones" element={<UbicacionesPage />} />
        </Route>

        {/* Programas */}
        <Route element={<PrivateRoute allowedRoles={ADMIN_ENC_INST} permisoRequerido="programas:leer" />}>
          <Route path="programas" element={<ProgramasPage />} />
        </Route>

        {/* Fichas (gestión) — solo quienes pueden crear fichas */}
        <Route element={<PrivateRoute allowedRoles={ADMIN_ENC} permisoRequerido="fichas:crear" />}>
          <Route path="fichas" element={<FichasPage />} />
        </Route>

        {/* Movimientos */}
        <Route element={<PrivateRoute allowedRoles={ADMIN_ENC} permisoRequerido="movimientos:leer" />}>
          <Route path="movimientos" element={<MovimientosPage />} />
        </Route>

        {/* Kardex */}
        <Route element={<PrivateRoute allowedRoles={ADMIN_ENC} permisoRequerido="kardex:leer" />}>
          <Route path="kardex" element={<KardexPage />} />
        </Route>

        {/* Materiales */}
        <Route element={<PrivateRoute allowedRoles={ADMIN_ENC} permisoRequerido="materiales:leer" />}>
          <Route path="materiales" element={<MaterialesPage />} />
          <Route path="materiales/nuevo" element={<NuevoMaterialPage />} />
          <Route path="materiales/editar/:id" element={<EditarMaterialPage />} />
        </Route>

        {/* Gestión Préstamos (vista completa de administración) */}
        <Route element={<PrivateRoute allowedRoles={ADMIN_ENC} permisoRequerido="prestamos:aprobar" />}>
          <Route path="prestamos" element={<GestionPrestamosPage />} />
        </Route>

        {/* Nuevo Préstamo — todos los roles excepto super_admin */}
        <Route element={<PrivateRoute allowedRoles={PUEDEN_PEDIR} />}>
          <Route path="prestamos/nuevo" element={<NuevoPrestamoPage />} />
        </Route>

        {/* Reportes */}
        <Route element={<PrivateRoute allowedRoles={ADMIN_ENC_INST} permisoRequerido="reportes:leer" />}>
          <Route path="reportes" element={<ReportesPage />} />
        </Route>

        {/* Solo Instructor Encargado */}
        <Route element={<PrivateRoute allowedRoles={[ROLES.INSTRUCTOR_ENCARGADO]} />}>
          <Route path="gestion-area" element={<GestionAreaPage />} />
        </Route>

        {/* Solo Instructor */}
        <Route element={<PrivateRoute allowedRoles={[ROLES.INSTRUCTOR]} />}>
          <Route path="mis-fichas" element={<MisFichasPage />} />
          <Route path="mis-prestamos" element={<MisPrestamosPage />} />
        </Route>

        {/* Aprendiz y Vocero */}
        <Route element={<PrivateRoute allowedRoles={[ROLES.APRENDIZ, ROLES.VOCERO]} />}>
          <Route path="mis-asignaciones" element={<MisAsignacionesPage />} />
        </Route>

        {/* Mi Bodega — cualquier rol que sea encargado */}
        <Route element={<PrivateRoute allowedRoles={TODOS} />}>
          <Route path="mi-bodega" element={<MiBodegaPage />} />
        </Route>

        {/* Todos los roles */}
        <Route element={<PrivateRoute allowedRoles={TODOS} />}>
          <Route path="mi-perfil" element={<MiPerfilPage />} />
        </Route>

        <Route
          path="unauthorized"
          element={
            <div className="p-10 text-center text-gray-500">
              No tienes permiso para acceder a esta sección.
            </div>
          }
        />
      </Route>

      <Route
        path="*"
        element={<div className="p-10 text-center text-gray-500">404 — Página no encontrada</div>}
      />
    </Routes>
  )
}
