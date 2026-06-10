import fondoImg from '@/assets/Fondo.jpg'
import { Logo } from '@/components/atoms/Logo/Logo'

export const LoginLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Panel izquierdo - Fondo */}
      <div
        className="hidden lg:flex lg:w-2/3 relative"
      >
        {/* Imagen fondo */}
        <img
          src={fondoImg}
          alt="Gest-Mat Background"
          className="w-full h-full object-cover"
        />

        {/* Overlay oscuro suave */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Logo */}
        <div className="absolute top-8 left-0 right-0 flex justify-center">
          <Logo size="lg" />
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/3 bg-white flex flex-col items-center justify-center px-8 py-12 lg:px-0">
        <div className="w-full max-w-sm">
          {/* Formulario */}
          {children}
        </div>
      </div>
    </div>
  )
}
