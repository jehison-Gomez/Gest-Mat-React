import api from './api'

export const centrosService = {
  getAll: async () => {
    const response = await api.get('/api/centros')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/api/centros/${id}`)
    return response.data
  },

  crear: async (data) => {
    const response = await api.post('/api/centros', data)
    return response.data
  },

  actualizar: async (id, data) => {
    const response = await api.patch(`/api/centros/${id}`, data)
    return response.data
  },

  eliminar: async (id) => {
    const response = await api.delete(`/api/centros/${id}`)
    return response.data
  },
}
