import api from './api'

const base = '/api/fichas'

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user') ?? '{}') } catch { return {} }
}

export const fichasService = {
  getAll: async () => (await api.get(base)).data,
  getById: async (id) => (await api.get(`${base}/${id}`)).data,
  crear: async (data) => (await api.post(base, data)).data,
  actualizar: async (id, data) => (await api.patch(`${base}/${id}`, data)).data,
  eliminar: async (id) => (await api.delete(`${base}/${id}`)).data,

  getMias: async () => {
    const data = (await api.get(base)).data
    const user = getUser()
    const lista = Array.isArray(data) ? data : (data.data ?? [])
    const mias = lista.filter(
      (f) => f.usuarioLider?.id === user.id || f.usuarioLiderId === user.id
    )
    return mias.length > 0 ? mias : lista
  },

  getAprendices: async (id) => (await api.get(`${base}/${id}/aprendices`)).data,
}
