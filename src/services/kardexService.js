import api from './api'
const base = '/api/kardex'
export const kardexService = {
  getAll: async () => (await api.get(base)).data,
  getById: async (id) => (await api.get(`${base}/${id}`)).data,
  crear: async (data) => (await api.post(base, data)).data,
}
