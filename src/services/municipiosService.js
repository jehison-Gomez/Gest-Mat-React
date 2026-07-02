import api from './api'

export const municipiosService = {
  getAll:     async ()       => (await api.get('/api/municipios')).data,
  crear:      async (data)   => (await api.post('/api/municipios', data)).data,
  actualizar: async (id, d)  => (await api.patch(`/api/municipios/${id}`, d)).data,
  eliminar:   async (id)     => (await api.delete(`/api/municipios/${id}`)).data,
}
