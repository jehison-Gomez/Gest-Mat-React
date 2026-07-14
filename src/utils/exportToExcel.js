import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/**
 * Exports a list of plain objects to an .xlsx file.
 * @param {object[]} rows - Array of flat objects (each key becomes a column header)
 * @param {string} fileName - Base file name without extension
 * @param {string} sheetName - Sheet tab name
 */
export const exportToExcel = (rows, fileName = 'reporte', sheetName = 'Datos') => {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `${fileName}.xlsx`)
}
