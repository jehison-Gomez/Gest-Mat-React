/**
 * Normalizes any backend response into a plain array.
 * Handles: raw array | { data: [] } | { items: [] } | any object with one array value.
 */
export const normalizeList = (data) => {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.data)) return data.data
  if (Array.isArray(data.items)) return data.items
  const firstArray = Object.values(data).find((v) => Array.isArray(v))
  return firstArray ?? []
}
