import api from './api'

export const materialesService = {
  getAll: async () => (await api.get('/api/materiales')).data,
  getById: async (id) => (await api.get(`/api/materiales/${id}`)).data,
  crear: async (data) => (await api.post('/api/materiales', data)).data,
  actualizar: async (id, data) => (await api.patch(`/api/materiales/${id}`, data)).data,
  eliminar: async (id) => (await api.delete(`/api/materiales/${id}`)).data,

  crearItem: async (data) => (await api.post('/api/material_item', data)).data,
  crearConsumible: async (data) => (await api.post('/api/material_consumible', data)).data,

  getAllItems: async () => (await api.get('/api/material_item')).data,
  getAllConsumibles: async () => (await api.get('/api/material_consumible')).data,
  actualizarConsumible: async (id, data) => (await api.patch(`/api/material_consumible/${id}`, data)).data,
  actualizarItem: async (id, data) => (await api.patch(`/api/material_item/${id}`, data)).data,
}
