import fondoImg from '@/assets/Fondo.jpg'
import gestmatLogo from '@/assets/gestmat_logo_transparente.png'
import { FiShield, FiPackage, FiBarChart2 } from 'react-icons/fi'

const features = [
  { icon: FiPackage,   text: 'Control total de inventario y materiales' },
  { icon: FiShield,    text: 'Acceso seguro con roles y permisos'       },
  { icon: FiBarChart2, text: 'Reportes y trazabilidad en tiempo real'   },
]

export const LoginLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-screen flex font-[Inter,system-ui,sans-serif]">

      {/* ══════════ PANEL IZQUIERDO ══════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">

        {/* Imagen base */}
        <img src={fondoImg} alt="" className="absolute inset-0 w-full h-full object-cover" />

        {/* Overlay oscuro suave — deja ver la imagen */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />

        {/* Viñeta lateral para separar del panel derecho */}
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/20 to-transparent" />

        {/* Contenido */}
        <div className="relative z-10 flex flex-col justify-between w-full px-14 py-12">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full bg-[#39A900]" />
            <img src={gestmatLogo} alt="Gest-Mat" className="h-10 object-contain drop-shadow-md brightness-0 invert" />
          </div>

          {/* Centro */}
          <div className="space-y-10">
            <div>
              {/* Chip */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-4 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39A900] animate-pulse" />
                <span className="text-white/80 text-xs font-medium tracking-wider uppercase">Sistema activo · SENA</span>
              </div>

              <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight drop-shadow-lg">
                Gestión de<br />
                <span className="text-[#7ed94a]">Materiales</span>
              </h1>

              <p className="text-white/65 text-base mt-5 leading-relaxed max-w-sm drop-shadow">
                Plataforma integral para la administración de recursos e inventarios del Centro de Formación.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-[#7ed94a]" />
                  </div>
                  <span className="text-white/75 text-sm drop-shadow">{text}</span>
                </div>
              ))}
            </div>

            {/* Stats cards glassmorphism */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { num: '99%',  label: 'Disponibilidad' },
                { num: '360°', label: 'Control total'  },
                { num: '24/7', label: 'Acceso seguro'  },
              ].map(({ num, label }) => (
                <div key={label} className="bg-white/8 backdrop-blur border border-white/12 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-white">{num}</p>
                  <p className="text-white/50 text-xs mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} Gest-Mat · SENA Colombia</p>
        </div>
      </div>

      {/* ══════════ PANEL DERECHO ══════════ */}
      <div className="w-full lg:w-[48%] bg-[#f8fafc] flex items-center justify-center px-6 py-12 relative overflow-hidden">

        {/* Decoración fondo */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#39A900]/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#39A900]/4 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-[400px]">

          {/* Logo móvil */}
          <div className="flex justify-center mb-8 lg:hidden">
            <img src={gestmatLogo} alt="Gest-Mat" className="h-10 object-contain" />
          </div>

          {/* Card del formulario */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8">
            {children}
          </div>

          {/* Aviso seguridad */}
          <p className="text-center text-xs text-gray-400 mt-5">
            Acceso exclusivo para personal autorizado del SENA
          </p>
        </div>
      </div>

    </div>
  )
}
