import api from './api'

export const prestamosService = {
  getAll: async () => {
    const res = await api.get('/api/prestamos')
    return res.data
  },

  getMios: async () => {
    const res = await api.get('/api/prestamos/mis-prestamos')
    return res.data
  },

  aprobar: async (id) => {
    const res = await api.put(`/api/prestamos/${id}/aprobar`)
    return res.data
  },

  rechazar: async (id, motivo) => {
    const res = await api.put(`/api/prestamos/${id}/rechazar`, { motivo })
    return res.data
  },

  entregar: async (id) => {
    const res = await api.put(`/api/prestamos/${id}/entregar`)
    return res.data
  },

  devolver: async (id) => {
    const res = await api.put(`/api/prestamos/${id}/devolver`)
    return res.data
  },
}
