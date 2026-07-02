import api from './api'

export const areasService = {
  getAll: async () => {
    const response = await api.get('/api/areas')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/api/areas/${id}`)
    return response.data
  },

  crear: async (data) => {
    const response = await api.post('/api/areas', data)
    return response.data
  },

  actualizar: async (id, data) => {
    const response = await api.patch(`/api/areas/${id}`, data)
    return response.data
  },

  eliminar: async (id) => {
    const response = await api.delete(`/api/areas/${id}`)
    return response.data
  },
}
