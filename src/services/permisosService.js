import api from './api'
const base = '/api/permisos'
export const permisosService = {
  getAll: async () => (await api.get(base)).data,
  crear: async (data) => (await api.post(base, data)).data,
  actualizar: async (id, data) => (await api.patch(`${base}/${id}`, data)).data,
  eliminar: async (id) => (await api.delete(`${base}/${id}`)).data,
}
