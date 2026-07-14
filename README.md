# Sistema de Gestión de Materiales SENA
## Frontend — Instrucciones para ejecutar

---

## Requisitos previos

Asegurate de tener instalado en tu computador:

| Herramienta | Como verificar |
|---|---|
| Node.js (version 18 o superior) | `node --version` |
| npm | `npm --version` |

---

## Importante

El frontend necesita que el **backend este corriendo** antes de abrirlo.
Asegurate de haber iniciado el backend en `http://localhost:3000` primero.

---

## PASO 1 — Instalar dependencias

Solo la primera vez que ejecutes el proyecto:

```bash
npm install
```

---

## PASO 2 — Iniciar el servidor de desarrollo

```bash
npm run dev
```

Cuando el frontend este listo veras este mensaje en consola:

```
  Local:   http://localhost:5173/
```

Abre el navegador en: **http://localhost:5173**

---

## Credenciales de acceso

```
Correo:     yamboroadmin@gmail.com
Contraseña: Admin123
```

---

## Comandos disponibles

| Comando | Descripcion |
|---|---|
| `npm run dev` | Inicia en modo desarrollo con recarga automatica |
| `npm run build` | Compila el proyecto para produccion |
| `npm run preview` | Previsualiza la version compilada |

---

## Orden correcto para iniciar todo el sistema

```
1. docker-compose up -d          (base de datos — desde la carpeta del backend)
2. npm run start:dev             (backend — desde la carpeta del backend)
3. npm run dev                   (frontend — desde esta carpeta)
4. Abrir http://localhost:5173   (en el navegador)
```

---

## Solucion de problemas

**El sistema muestra pantalla en blanco o no carga datos:**
Solucion: verifica que el backend este corriendo en `http://localhost:3000`

**Error al instalar dependencias:**
Solucion: elimina la carpeta `node_modules` y el archivo `package-lock.json`, luego ejecuta `npm install` nuevamente.
