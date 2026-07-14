import { useState, useEffect } from 'react'
import { ubicacionesService } from '@/services/ubicacionesService'

// Module-level cache — survives component re-renders, cleared on page reload
let _cache = null

export const useBodega = () => {
  const [bodegas, setBodegas]   = useState(_cache ?? [])
  const [cargando, setCargando] = useState(_cache === null)

  useEffect(() => {
    if (_cache !== null) return
    ubicacionesService.getMiBodega()
      .then(data => {
        _cache = Array.isArray(data) ? data : []
        setBodegas(_cache)
      })
      .catch(() => {
        _cache = []
        setBodegas([])
      })
      .finally(() => setCargando(false))
  }, [])

  return { bodegas, cargando, esBodeguero: bodegas.length > 0 }
}
