import { useState } from 'react'
import { Sidebar } from '@/components/organisms/Sidebar/Sidebar'
import { TopBar } from '@/components/organisms/TopBar/TopBar'
import { ModalCompletarPerfil, debeCompletarPerfil } from '@/components/organisms/ModalCompletarPerfil/ModalCompletarPerfil'
import { useAuth } from '@/hooks/useAuth'

export const DashboardLayout = ({ children }) => {
  const { user } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.innerWidth < 1024
  )
  const [mostrarModal, setMostrarModal] = useState(
    () => debeCompletarPerfil(user)
  )

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto anim-fade-up">
            {children}
          </div>
        </main>
      </div>

      {mostrarModal && user && (
        <ModalCompletarPerfil
          user={user}
          onCompletado={() => setMostrarModal(false)}
        />
      )}
    </div>
  )
}
