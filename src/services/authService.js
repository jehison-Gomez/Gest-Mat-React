import api from './api'

export const authService = {
  login: async (correo, contrasena) => {
    await api.post('/api/auth/login', { correo, contrasena })

    // Obtener datos del usuario autenticado directo desde el JWT
    const meResponse = await api.get('/api/auth/me')
    const me = meResponse.data

    if (!me?.id) throw new Error('No se pudo obtener el perfil del usuario')

    localStorage.setItem('permisos', JSON.stringify(me.permisos || []))

    return {
      id:     me.id,
      nombre: me.nombre,
      correo: me.correo,
      rol:    me.rol,
      sedeId: me.sedeId ?? null,
    }
  },

  logout: async () => {
    await api.post('/api/auth/logout')
    localStorage.removeItem('permisos')
  },

  solicitarRecuperacion: async (correo) => {
    const response = await api.post('/api/auth/recuperar-contrasena', { correo })
    return response.data
  },

  verificarCodigo: async (correo, codigo) => {
    const response = await api.post('/api/auth/verificar-codigo', { correo, codigo })
    return response.data
  },

  restablecerContrasena: async (correo, codigo, nuevaContrasena) => {
    const response = await api.post('/api/auth/restablecer-contrasena', { correo, codigo, nuevaContrasena })
    return response.data
  },
}
