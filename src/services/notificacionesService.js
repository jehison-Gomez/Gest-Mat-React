import api from './api'

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user') ?? '{}') } catch { return {} }
}

export const notificacionesService = {
  getMis: async () => {
    const user = getUser()
    if (!user?.id) return []
    const res = await api.get(`/api/notificaciones?destinatarioId=${user.id}`)
    return res.data ?? []
  },

  marcarLeida: async (id) => {
    await api.patch(`/api/notificaciones/${id}/leer`)
  },

  marcarTodasLeidas: async () => {
    const user = getUser()
    if (!user?.id) return
    await api.patch(`/api/notificaciones/leer-todas?destinatarioId=${user.id}`)
  },
}
