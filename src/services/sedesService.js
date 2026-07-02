import api from './api'

export const sedesService = {
  getAll: async () => {
    const response = await api.get('/api/sedes')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/api/sedes/${id}`)
    return response.data
  },

  crear: async (data) => {
    const response = await api.post('/api/sedes', data)
    return response.data
  },

  actualizar: async (id, data) => {
    const response = await api.patch(`/api/sedes/${id}`, data)
    return response.data
  },

  eliminar: async (id) => {
    const response = await api.delete(`/api/sedes/${id}`)
    return response.data
  },
}
