import api from './api'

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user') ?? '{}') } catch { return {} }
}

export const prestamosService = {
  getAll: async () => (await api.get('/api/prestamos')).data,

  getMios: async () => {
    const user = getUser()
    const res = await api.get(`/api/prestamos/usuario/${user.id}`)
    return res.data
  },

  crear: async (data) => (await api.post('/api/prestamos', data)).data,

  agregarItem: async (data) => (await api.post('/api/prestamo-item', data)).data,
  agregarConsumible: async (data) => (await api.post('/api/prestamo-consumible', data)).data,

  aprobar: async (id, dto = {}) => (await api.post(`/api/prestamos/${id}/aprobar`, dto)).data,
  rechazar: async (id, observacionRevision = 'Sin motivo') => (await api.post(`/api/prestamos/${id}/rechazar`, { observacionRevision })).data,
  entregar: async (id) => (await api.post(`/api/prestamos/${id}/entregar`)).data,
  devolver: async (id) => (await api.post(`/api/prestamos/${id}/devolver`)).data,
}
