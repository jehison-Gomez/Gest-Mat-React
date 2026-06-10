import { Routes, Route } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { ROLES } from '@/hooks/useAuth'

import LoginPage from '@/pages/LoginPage'

// Admin
import DashboardPage from '@/pages/admin/DashboardPage'
import MaterialesPage from '@/pages/admin/MaterialesPage'
import NuevoMaterialPage from '@/pages/admin/NuevoMaterialPage'
import EditarMaterialPage from '@/pages/admin/EditarMaterialPage'
import AreasPage from '@/pages/admin/AreasPage'
import NuevaAreaPage from '@/pages/admin/NuevaAreaPage'
import EditarAreaPage from '@/pages/admin/EditarAreaPage'
import UsuariosPage from '@/pages/admin/UsuariosPage'
import NuevoUsuarioPage from '@/pages/admin/NuevoUsuarioPage'
import EditarUsuarioPage from '@/pages/admin/EditarUsuarioPage'
import ReportesPage from '@/pages/admin/ReportesPage'
import RolesPage from '@/pages/admin/RolesPage'
import PermisosPage from '@/pages/admin/PermisosPage'
import CategoriasPage from '@/pages/admin/CategoriasPage'
import TiposUbicacionPage from '@/pages/admin/TiposUbicacionPage'
import UbicacionesPage from '@/pages/admin/UbicacionesPage'
import ProgramasPage from '@/pages/admin/ProgramasPage'
import FichasPage from '@/pages/admin/FichasPage'
import MovimientosPage from '@/pages/admin/MovimientosPage'
import KardexPage from '@/pages/admin/KardexPage'

// Shared
import GestionPrestamosPage from '@/pages/shared/GestionPrestamosPage'

// Instructor Encargado
import GestionAreaPage from '@/pages/instructor_encargado/GestionAreaPage'

// Instructor
import MisFichasPage from '@/pages/instructor/MisFichasPage'
import MisPrestamosPage from '@/pages/instructor/MisPrestamosPage'

// Aprendiz / Vocero
import MisAsignacionesPage from '@/pages/aprendiz/MisAsignacionesPage'

const ADMIN = [ROLES.ADMINISTRADOR]
const ADMIN_ENC = [ROLES.ADMINISTRADOR, ROLES.INSTRUCTOR_ENCARGADO]
const ADMIN_ENC_INST = [ROLES.ADMINISTRADOR, ROLES.INSTRUCTOR_ENCARGADO, ROLES.INSTRUCTOR]
const TODOS = [ROLES.ADMINISTRADOR, ROLES.INSTRUCTOR_ENCARGADO, ROLES.INSTRUCTOR, ROLES.VOCERO, ROLES.APRENDIZ]

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route path="/app">
        {/* Solo Admin */}
        <Route element={<PrivateRoute allowedRoles={ADMIN} />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="areas" element={<AreasPage />} />
          <Route path="areas/nueva" element={<NuevaAreaPage />} />
          <Route path="areas/editar/:id" element={<EditarAreaPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="usuarios/nuevo" element={<NuevoUsuarioPage />} />
          <Route path="usuarios/editar/:id" element={<EditarUsuarioPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="permisos" element={<PermisosPage />} />
          <Route path="categorias" element={<CategoriasPage />} />
          <Route path="ubicaciones" element={<UbicacionesPage />} />
          <Route path="tipos-ubicacion" element={<TiposUbicacionPage />} />
          <Route path="programas" element={<ProgramasPage />} />
          <Route path="fichas" element={<FichasPage />} />
          <Route path="movimientos" element={<MovimientosPage />} />
          <Route path="kardex" element={<KardexPage />} />
        </Route>

        {/* Admin + Encargado */}
        <Route element={<PrivateRoute allowedRoles={ADMIN_ENC} />}>
          <Route path="materiales" element={<MaterialesPage />} />
          <Route path="materiales/nuevo" element={<NuevoMaterialPage />} />
          <Route path="materiales/editar/:id" element={<EditarMaterialPage />} />
          <Route path="prestamos" element={<GestionPrestamosPage />} />
        </Route>

        {/* Admin + Encargado + Instructor */}
        <Route element={<PrivateRoute allowedRoles={ADMIN_ENC_INST} />}>
          <Route path="reportes" element={<ReportesPage />} />
        </Route>

        {/* Solo Encargado */}
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

        <Route path="unauthorized" element={<div className="p-10 text-center text-gray-500">Acceso no autorizado</div>} />
      </Route>

      <Route path="*" element={<div className="p-10 text-center text-gray-500">404 - Página no encontrada</div>} />
    </Routes>
  )
}
