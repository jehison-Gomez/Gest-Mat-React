import fondoImg    from '@/assets/Fondo.jpg'
import gestmatLogo from '@/assets/gestmat_logo_transparente.png'
import { FiShield, FiPackage, FiBarChart2 } from 'react-icons/fi'

const features = [
  { icon: FiPackage,   text: 'Control total de inventario y materiales' },
  { icon: FiShield,    text: 'Acceso seguro con roles y permisos'       },
  { icon: FiBarChart2, text: 'Reportes y trazabilidad en tiempo real'   },
]

export const LoginLayout = ({ children }) => {
  return (
    /* Fondo con imagen */
    <div
      className="min-h-screen w-screen flex items-center justify-center p-4 md:p-8 font-[Inter,system-ui,sans-serif]"
      style={{
        backgroundImage:    `url(${fondoImg})`,
        backgroundSize:     'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Tarjeta principal — bordes redondeados */}
      <div className="relative z-10 w-full max-w-4xl flex rounded-3xl overflow-hidden shadow-2xl shadow-black/40">

        {/* ── Panel izquierdo (branding) ── */}
        <div className="hidden md:flex md:w-[46%] flex-col justify-between p-10 bg-black/40 backdrop-blur-md border-r border-white/10">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 rounded-full bg-[#39A900]" />
            <img
              src={gestmatLogo}
              alt="Gest-Mat"
              className="h-8 object-contain brightness-0 invert drop-shadow"
              onError={e => { e.target.style.display = 'none' }}
            />
          </div>

          {/* Centro */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39A900] animate-pulse" />
              <span className="text-white/80 text-xs font-medium tracking-wider uppercase">Sistema activo · SENA</span>
            </div>

            <div>
              <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
                Gestión de<br />
                <span className="text-[#7ed94a]">Materiales</span>
              </h1>
              <p className="text-white/60 text-sm mt-4 leading-relaxed">
                Plataforma integral para la administración de recursos e inventarios del Centro de Formación.
              </p>
            </div>

            <div className="space-y-3.5">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-[#7ed94a]" />
                  </div>
                  <span className="text-white/75 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-white/25 text-xs">© {new Date().getFullYear()} Gest-Mat · SENA Colombia</p>
        </div>

        {/* ── Panel derecho (formulario) ── */}
        <div className="w-full md:w-[54%] bg-white flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-sm">

            {/* Logo solo en móvil */}
            <div className="flex justify-center mb-8 md:hidden">
              <img src={gestmatLogo} alt="Gest-Mat" className="h-10 object-contain" />
            </div>

            {children}
          </div>
        </div>

      </div>
    </div>
  )
}
