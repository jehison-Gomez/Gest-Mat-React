import {
  FiGrid, FiPackage, FiRepeat, FiSettings,
  FiUsers, FiFileText, FiMapPin, FiBookOpen, FiList, FiTrendingUp,
} from 'react-icons/fi'

export const menuPorRol = {
  administrador: [
    { icono: FiGrid, label: 'Dashboard', to: '/app/dashboard' },
    {
      icono: FiPackage,
      label: 'Gestion',
      subItems: [
        { label: 'Áreas', to: '/app/areas' },
        { label: 'Materiales', to: '/app/materiales' },
        { label: 'Ubicaciones', to: '/app/ubicaciones' },
        { label: 'Programas', to: '/app/programas' },
        { label: 'Fichas', to: '/app/fichas' },
      ],
    },
    { icono: FiRepeat, label: 'Gestion Préstamos', to: '/app/prestamos' },
    {
      icono: FiTrendingUp,
      label: 'Inventario',
      subItems: [
        { label: 'Movimientos', to: '/app/movimientos' },
        { label: 'Kardex', to: '/app/kardex' },
      ],
    },
    { icono: FiUsers, label: 'Usuarios', to: '/app/usuarios' },
    { icono: FiFileText, label: 'Reportes', to: '/app/reportes' },
    {
      icono: FiSettings,
      label: 'Configuracion',
      subItems: [
        { label: 'Roles', to: '/app/roles' },
        { label: 'Permisos', to: '/app/permisos' },
        { label: 'Categoria Material', to: '/app/categorias' },
        { label: 'Tipo Ubicacion', to: '/app/tipos-ubicacion' },
      ],
    },
  ],

  instructor_encargado: [
    { icono: FiGrid, label: 'Dashboard', to: '/app/dashboard' },
    { icono: FiPackage, label: 'Materiales', to: '/app/materiales' },
    { icono: FiMapPin, label: 'Mi Área', to: '/app/gestion-area' },
    { icono: FiRepeat, label: 'Préstamos', to: '/app/prestamos' },
    { icono: FiFileText, label: 'Reportes', to: '/app/reportes' },
  ],

  instructor: [
    { icono: FiGrid, label: 'Dashboard', to: '/app/dashboard' },
    { icono: FiBookOpen, label: 'Mis Fichas', to: '/app/mis-fichas' },
    { icono: FiRepeat, label: 'Mis Préstamos', to: '/app/mis-prestamos' },
    { icono: FiFileText, label: 'Reportes', to: '/app/reportes' },
  ],

  vocero: [
    { icono: FiList, label: 'Mis Asignaciones', to: '/app/mis-asignaciones' },
  ],

  aprendiz: [
    { icono: FiList, label: 'Mis Asignaciones', to: '/app/mis-asignaciones' },
  ],
}
