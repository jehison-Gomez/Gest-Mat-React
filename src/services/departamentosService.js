import api from './api'

export const departamentosService = {
  getAll:     async ()       => (await api.get('/api/departamentos')).data,
  crear:      async (data)   => (await api.post('/api/departamentos', data)).data,
  actualizar: async (id, d)  => (await api.patch(`/api/departamentos/${id}`, d)).data,
  eliminar:   async (id)     => (await api.delete(`/api/departamentos/${id}`)).data,
}
