import api from './api'
const base = '/api/roles'
export const rolesService = {
  getAll:       async ()        => (await api.get(base)).data,
  getById:      async (id)      => (await api.get(`${base}/${id}`)).data,
  getPermisos:  async (roleId)  => (await api.get(`/api/rol-permisos?roleId=${roleId}`)).data,
  crear:        async (data)    => (await api.post(base, data)).data,
  actualizar:   async (id, data)=> (await api.patch(`${base}/${id}`, data)).data,
  eliminar:     async (id)      => (await api.delete(`${base}/${id}`)).data,
}
