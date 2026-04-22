# 📘 Manual de Administración - Plataforma Fichas Técnicas NP

Este documento es la guía definitiva para administrar, actualizar y mantener la plataforma de **Novedades Plásticas**.

---

## 1. 🔑 Datos Maestros (Credenciales)

Guarda estos datos en un lugar seguro. Son las llaves de toda la infraestructura.

### 🌐 Repositorio de Código (GitHub)
*   **Nombre:** `fichas-tecnicas`
*   **URL:** [https://github.com/plasticasnovedades0-star/fichas-tecnicas](https://github.com/plasticasnovedades0-star/fichas-tecnicas)
*   **Despliegue:** Se actualiza automáticamente al hacer `git push`.

### 🗄️ Base de Datos y Storage (Supabase)
*   **URL Proyecto:** `https://fnhqpqnretooavpsobri.supabase.co`
*   **Anon Key:** `sb_publishable_oN67frGtXxOa9qt4oC1h9A_pkNEBGwt`
*   **Panel de Control:** [Supabase Dashboard](https://supabase.com/dashboard) (Entrar con el correo registrado).

### 🛡️ Acceso Panel Web (Administrador)
*   **Usuario:** `admin`
*   **Contraseña:** `admin123`

---

## 2. 📁 Origen de Datos (OneDrive)
Los archivos se sincronizan desde esta carpeta local:
`C:\Users\WilsonGarcia\OneDrive - NOVEDADES PLASTICAS SA\FICHAS TECNICAS - PROCESO DE MERCADEO`

---

## 🚀 3. Guía de Uso de los Scripts de Actualización

He creado dos herramientas automáticas que te ahorran horas de trabajo manual.

### 🛠️ Herramienta 1: El Observador (`watcher.js`)
**¿Para qué sirve?** Para que la web se actualice sola mientras tú añades o cambias archivos en tu carpeta de OneDrive.
*   **Cómo usarlo:**
    1. Abre una terminal en la carpeta del proyecto.
    2. Ejecuta: `npm run watch`
    3. Deja la ventana abierta. Cada vez que guardes un PDF o Excel en la carpeta, verás un mensaje de "✅ ¡Sincronizado!" en la pantalla.

### 🛠️ Herramienta 2: Subida Masiva (`bulk_upload.js`)
**¿Para qué sirve?** Para subir todos los archivos de la carpeta de golpe (útil para la primera vez o después de un largo tiempo sin internet).
*   **Cómo usarlo:**
    1. Abre una terminal en la carpeta del proyecto.
    2. Ejecuta: `node bulk_upload.js`
    3. El script revisará todos los archivos y subirá solo los que no existan en la web.

---

## 🛠️ 4. Solución de Problemas Comunes

### La página se ve blanca o da error 404
*   Verifica en la pestaña **Actions** de GitHub si el último proceso terminó en verde ✅.
*   Asegúrate de que el archivo `.nojekyll` esté presente en la raíz del proyecto.

### El móvil no muestra el logo oficial
*   Borra el acceso directo anterior del celular.
*   Refresca la página 2 veces y vuelve a "Agregar a pantalla de inicio".

### No se suben archivos nuevos
*   Asegúrate de que la terminal donde corre `npm run watch` no esté pausada o cerrada.
*   Verifica que los archivos terminen en `.pdf` o `.xlsx`.

---
*Manual actualizado el 22 de Abril de 2026.*
