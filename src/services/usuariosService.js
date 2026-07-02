import api from './api'

export const usuariosService = {
  getAll: async () => {
    const response = await api.get('/api/usuarios')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/api/usuarios/${id}`)
    return response.data
  },

  crear: async (data) => {
    const response = await api.post('/api/usuarios', data)
    return response.data
  },

  actualizar: async (id, data) => {
    const response = await api.patch(`/api/usuarios/${id}`, data)
    return response.data
  },

  eliminar: async (id) => {
    const response = await api.delete(`/api/usuarios/${id}`)
    return response.data
  },

  getPermisos: async (id) => {
    const response = await api.get(`/api/usuarios/${id}/permisos`)
    return response.data
  },
}
