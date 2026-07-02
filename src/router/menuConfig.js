import {
  FiGrid, FiPackage, FiRepeat, FiSettings,
  FiUsers, FiFileText, FiMapPin, FiBookOpen, FiList, FiTrendingUp, FiUser,
} from 'react-icons/fi'

// Campos de cada item:
//   permiso: 'modulo:accion'       → mostrar si el usuario tiene ese permiso
//   soloRoles: string[]            → adicionalmente restringir a esos roles
//   excluirConPermiso: 'mod:accion'→ ocultar si el usuario YA TIENE ese permiso
//   subItems: []                   → grupo, visible si al menos un subItem es visible

export const MENU_ITEMS = [
  // Super Admin — estructura global
  {
    icono: FiMapPin,
    label: 'Estructura',
    subItems: [
      { label: 'Departamentos y Municipios', to: '/app/ubicaciones-geo', soloRoles: ['super_admin'] },
      { label: 'Centros', to: '/app/centros', permiso: 'centros:leer', soloRoles: ['super_admin'] },
      { label: 'Sedes',   to: '/app/sedes',   permiso: 'sedes:leer',   soloRoles: ['super_admin'] },
    ],
  },
  {
    icono: FiGrid,
    label: 'Dashboard',
    to:    '/app/dashboard',
    permiso: 'dashboard:leer',
  },
  {
    icono: FiPackage,
    label: 'Gestión',
    subItems: [
      { label: 'Áreas',       to: '/app/areas',       permiso: 'areas:leer'      },
      { label: 'Materiales',  to: '/app/materiales',  permiso: 'materiales:leer' },
      { label: 'Ubicaciones', to: '/app/ubicaciones', permiso: 'ubicaciones:leer'},
      { label: 'Programas',   to: '/app/programas',   permiso: 'programas:leer'  },
      // "Fichas" (gestión) solo para quienes pueden crear fichas
      { label: 'Fichas',      to: '/app/fichas',      permiso: 'fichas:crear'    },
    ],
  },
  // Gestión Préstamos (vista de administración) — requiere poder aprobar
  {
    icono: FiRepeat,
    label: 'Gestión Préstamos',
    to:    '/app/prestamos',
    permiso: 'prestamos:aprobar',
  },
  // Mis Préstamos — para instructores que pueden crear pero no aprobar
  {
    icono: FiRepeat,
    label: 'Mis Préstamos',
    to:    '/app/mis-prestamos',
    permiso:            'prestamos:crear',
    soloRoles:          ['instructor'],
    excluirConPermiso:  'prestamos:aprobar',
  },
  // Solicitar Préstamo — para voceros
  {
    icono: FiRepeat,
    label: 'Solicitar Préstamo',
    to:    '/app/prestamos/nuevo',
    permiso:   'prestamos:crear',
    soloRoles: ['vocero'],
  },
  // Items exclusivos por rol
  { icono: FiMapPin,   label: 'Mi Área',          to: '/app/gestion-area',     soloRoles: ['instructor_encargado'] },
  { icono: FiBookOpen, label: 'Mis Fichas',         to: '/app/mis-fichas',       soloRoles: ['instructor'] },
  { icono: FiList,     label: 'Mis Asignaciones',  to: '/app/mis-asignaciones', soloRoles: ['vocero', 'aprendiz'] },
  // Inventario
  {
    icono: FiTrendingUp,
    label: 'Inventario',
    subItems: [
      { label: 'Movimientos', to: '/app/movimientos', permiso: 'movimientos:leer' },
      { label: 'Kardex',      to: '/app/kardex',      permiso: 'kardex:leer'      },
    ],
  },
  { icono: FiUsers,    label: 'Usuarios',   to: '/app/usuarios', permiso: 'usuarios:leer'   },
  { icono: FiFileText, label: 'Reportes',   to: '/app/reportes', permiso: 'reportes:leer'   },
  {
    icono: FiSettings,
    label: 'Configuración',
    subItems: [
      { label: 'Roles',              to: '/app/roles',           permiso: 'roles:leer'         },
      { label: 'Permisos',           to: '/app/permisos',        permiso: 'configuracion:leer' },
      { label: 'Categoría Material', to: '/app/categorias',      permiso: 'configuracion:leer' },
      { label: 'Tipo Ubicación',     to: '/app/tipos-ubicacion', permiso: 'configuracion:leer' },
    ],
  },
  { icono: FiUser, label: 'Mi Perfil', to: '/app/mi-perfil' },
]
