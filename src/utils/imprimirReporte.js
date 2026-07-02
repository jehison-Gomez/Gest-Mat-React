export function imprimirReporte({ titulo, subtitulo = '', columnas = [], filas = [] }) {
  const fecha = new Date().toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const encabezados = columnas.map(c => `<th>${c.label}</th>`).join('')
  const filasHTML = filas.map((fila, i) => `
    <tr class="${i % 2 === 0 ? '' : 'alt'}">
      ${columnas.map(c => `<td>${fila[c.key] ?? '—'}</td>`).join('')}
    </tr>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${titulo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      color: #1a1a1a;
      padding: 24px 32px;
      background: #fff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #39a900;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .logo {
      font-size: 24px;
      font-weight: 900;
      color: #39a900;
      letter-spacing: -0.5px;
    }
    .logo span { color: #1a1a1a; }
    .header-right h1 {
      font-size: 15px;
      font-weight: bold;
      color: #111;
      text-align: right;
    }
    .header-right p {
      font-size: 10px;
      color: #666;
      text-align: right;
      margin-top: 3px;
    }
    .subtitulo {
      background: #f0fdf0;
      border-left: 4px solid #39a900;
      padding: 8px 12px;
      margin-bottom: 14px;
      font-size: 11px;
      color: #166534;
      font-weight: 600;
      border-radius: 0 4px 4px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }
    thead th {
      background: #39a900;
      color: #fff;
      padding: 8px 10px;
      text-align: left;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    tbody td {
      padding: 7px 10px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 11px;
      vertical-align: top;
    }
    tbody tr.alt td { background: #f9fafb; }
    .footer {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e5e7eb;
      padding-top: 10px;
      font-size: 9px;
      color: #9ca3af;
    }
    @media print {
      body { padding: 12px 16px; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Gest<span>Mat</span></div>
    <div class="header-right">
      <h1>${titulo}</h1>
      <p>Generado el: ${fecha}</p>
      <p>Sistema de Gestión de Materiales — SENA</p>
    </div>
  </div>
  ${subtitulo ? `<div class="subtitulo">${subtitulo}</div>` : ''}
  <table>
    <thead><tr>${encabezados}</tr></thead>
    <tbody>${filasHTML}</tbody>
  </table>
  <div class="footer">
    <span>${filas.length} registro(s) encontrado(s)</span>
    <span>Documento generado automáticamente · Confidencial</span>
  </div>
  <script>window.onload = () => { window.focus(); window.print(); }<\/script>
</body>
</html>`

  const ventana = window.open('', '_blank', 'width=900,height=700')
  if (!ventana) return
  ventana.document.write(html)
  ventana.document.close()
}
