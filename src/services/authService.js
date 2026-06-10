import api from './api'

export const authService = {
  login: async (correo, contrasena) => {
    await api.post('/api/auth/login', { correo, contrasena })

    const usersResponse = await api.get('/api/usuarios')
    const users = usersResponse.data || []
    const correoNorm = correo.trim().toLowerCase()
    const found = users.find((u) => u.correo === correoNorm)

    if (!found) throw new Error('No se encontró el usuario')

    return {
      id: found.id,
      nombre: found.nombre,
      correo: found.correo,
      rol: found.role?.nombre?.toLowerCase() ?? null,
      estado: found.estado,
    }
  },

  logout: async () => {
    await api.post('/api/auth/logout')
  },

  solicitarRecuperacion: async (correo) => {
    const response = await api.post('/api/auth/recuperar-contrasena', {
      correo,
    })
    return response.data
  },

  verificarCodigo: async (correo, codigo) => {
    const response = await api.post('/api/auth/verificar-codigo', {
      correo,
      codigo,
    })
    return response.data
  },

  restablecerContrasena: async (correo, codigo, nuevaContrasena) => {
    const response = await api.post('/api/auth/restablecer-contrasena', {
      correo,
      codigo,
      nuevaContrasena,
    })
    return response.data
  },
}
