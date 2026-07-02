import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '@/context/ToastContext'
import { ToastContainer } from '@/components/organisms/ToastContainer/ToastContainer'
import { AppRouter } from '@/router/AppRouter'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRouter />
        <ToastContainer />
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
