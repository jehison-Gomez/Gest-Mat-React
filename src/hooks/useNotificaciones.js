import { useEffect, useState, useCallback } from 'react'
import { notificacionesService } from '@/services/notificacionesService'
import { materialesService } from '@/services/materialesService'
import { useAuth } from '@/hooks/useAuth'

export const useNotificaciones = () => {
  const { user, isAdministrador, isInstructorEncargado } = useAuth()
  const [notificaciones, setNotificaciones] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    if (!user) return
    setCargando(true)
    const lista = []

    // 1. Notificaciones reales del backend (préstamos)
    try {
      const backend = await notificacionesService.getMis()
      backend.forEach(n => {
        lista.push({
          id:     n.id,
          tipo:   n.tipo,          // 'prestamo_nuevo' | 'prestamo_aprobado' | 'prestamo_rechazado'
          titulo: n.titulo,
          detalle:n.mensaje,
          ruta:   n.ruta ?? '/app/prestamos',
          fecha:  n.creadoEn,
          esBackend: true,         // flag para mostrar botón "marcar como leída"
        })
      })
    } catch {
      // sin conexión o sin permisos — se omiten
    }

    // 2. Stock bajo y vencimiento (calculado en frontend, solo para gestores)
    if (isAdministrador || isInstructorEncargado) {
      try {
        const consumibles = await materialesService.getAllConsumibles()
        const hoy = Date.now()
        consumibles.forEach(c => {
          const nombre = c.materiale?.nombre ?? 'Material'

          // Stock bajo
          if (Number(c.stockActual) <= Number(c.stockMinimo)) {
            lista.push({
              id:        `stock-bajo-${c.id}`,
              tipo:      'stock',
              titulo:    'Stock bajo',
              detalle:   `${nombre} — quedan ${c.stockActual} ${c.unidadMedida ?? ''}`,
              ruta:      '/app/materiales',
              esBackend: false,
            })
          }

          // Vencimiento
          if (c.fechaVencimiento) {
            const diasRestantes = Math.floor((new Date(c.fechaVencimiento).getTime() - hoy) / 86_400_000)
            if (diasRestantes < 0) {
              lista.push({
                id:        `vencido-${c.id}`,
                tipo:      'vencido',
                titulo:    'Material vencido',
                detalle:   `${nombre} venció hace ${Math.abs(diasRestantes)} día(s)`,
                ruta:      '/app/materiales',
                esBackend: false,
              })
            } else if (diasRestantes <= 30) {
              lista.push({
                id:        `por-vencer-${c.id}`,
                tipo:      'porvencer',
                titulo:    'Próximo a vencer',
                detalle:   `${nombre} vence en ${diasRestantes} día(s)`,
                ruta:      '/app/materiales',
                esBackend: false,
              })
            }
          }
        })
      } catch {
        // sin permisos o error de red
      }
    }

    setNotificaciones(lista)
    setCargando(false)
  }, [user, isAdministrador, isInstructorEncargado])

  useEffect(() => {
    cargar()
    const intervalo = setInterval(cargar, 30_000) // cada 30 segundos
    return () => clearInterval(intervalo)
  }, [cargar])

  const marcarLeida = async (id) => {
    try {
      await notificacionesService.marcarLeida(id)
      setNotificaciones(prev => prev.filter(n => n.id !== id))
    } catch {/* */}
  }

  const marcarTodasLeidas = async () => {
    try {
      await notificacionesService.marcarTodasLeidas()
      // Solo eliminar las del backend (las de stock se quedan hasta que se resuelvan)
      setNotificaciones(prev => prev.filter(n => !n.esBackend))
    } catch {/* */}
  }

  return { notificaciones, cargando, recargar: cargar, marcarLeida, marcarTodasLeidas }
}
