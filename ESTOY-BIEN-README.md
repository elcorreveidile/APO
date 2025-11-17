# Estoy Bien - Sistema de Check-in Diario

## 📋 Descripción

**Estoy Bien** es una aplicación web diseñada para ayudar a personas que viven solas a reportar su estado diario. La aplicación permite configurar contactos de confianza que recibirán alertas automáticas si el usuario no realiza su check-in diario en períodos de 24, 48 y 72 horas.

## ✨ Características Principales

### 🎯 Check-in Diario
- Interfaz simple y clara para reportar "Estoy Bien" con un solo clic
- Visualización del estado actual (Todo Bien, Atención, Alerta, Alerta Crítica)
- Indicador visual del tiempo transcurrido desde el último check-in

### 👥 Gestión de Contactos
- Agregar contactos de confianza con nombre, teléfono, email y relación
- Ver lista completa de contactos configurados
- Eliminar contactos cuando sea necesario

### ⏰ Sistema de Alertas Automáticas
- **Alerta 24h**: Primera notificación a contactos después de 24 horas sin check-in
- **Alerta 48h**: Segunda notificación después de 48 horas sin check-in
- **Alerta 72h**: Alerta crítica después de 72 horas sin check-in

### 📊 Historial y Estadísticas
- Visualización de todos los check-ins realizados
- Línea de tiempo con calendario de actividad
- Estadísticas de racha actual
- Historial de alertas enviadas
- Filtros por período (hoy, esta semana, este mes)

## 🚀 Comenzar a Usar

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (solo para cargar las librerías CSS)
- No requiere instalación ni servidor

### Instalación

1. **Descarga o clona los archivos:**
   ```bash
   # Los archivos necesarios son:
   - estoy-bien.html
   - estoy-bien-contactos.html
   - estoy-bien-historial.html
   - estoy-bien.js
   ```

2. **Abre la aplicación:**
   - Simplemente abre `estoy-bien.html` en tu navegador web
   - O usa un servidor local:
     ```bash
     python -m http.server 8000
     # Luego visita: http://localhost:8000/estoy-bien.html
     ```

### Primer Uso

1. **Configura tus contactos:**
   - Haz clic en el botón "Contactos" en la parte superior
   - Agrega al menos un contacto de confianza
   - Completa todos los campos: nombre, teléfono, email y relación

2. **Realiza tu primer check-in:**
   - Vuelve a la página principal
   - Haz clic en el botón "Reportar Estoy Bien"
   - Verás una confirmación de que tu check-in fue registrado

3. **Revisa el historial:**
   - Haz clic en "Ver Todo" en la sección de Historial
   - Podrás ver todos tus check-ins pasados y estadísticas

## 📱 Páginas de la Aplicación

### 1. Página Principal (`estoy-bien.html`)
- **Botón principal** para hacer check-in
- **Indicador de estado** visual con códigos de color:
  - 🟢 Verde: Todo bien (menos de 24h)
  - 🟡 Amarillo: Atención (24-48h)
  - 🟠 Naranja: Alerta (48-72h)
  - 🔴 Rojo: Alerta crítica (más de 72h)
- **Sistema de alertas** con temporizadores para 24h, 48h y 72h
- **Resumen de contactos** de confianza
- **Historial reciente** de los últimos 5 check-ins

### 2. Gestión de Contactos (`estoy-bien-contactos.html`)
- **Formulario** para agregar nuevos contactos
- **Lista completa** de todos los contactos
- **Opciones de edición** y eliminación
- **Confirmación** antes de eliminar contactos

### 3. Historial (`estoy-bien-historial.html`)
- **Estadísticas generales**:
  - Total de check-ins realizados
  - Racha actual de días consecutivos
  - Última alerta enviada
- **Línea de tiempo** con todos los check-ins
- **Filtros** por período de tiempo
- **Historial de alertas** enviadas

## 🔔 Sistema de Alertas

### Cómo Funcionan las Alertas

La aplicación verifica automáticamente cada minuto si han pasado 24, 48 o 72 horas desde el último check-in:

1. **Alerta de 24 horas** (⚠️)
   - Se activa cuando han pasado 24 horas sin check-in
   - Indicador visual amarillo
   - Notificación a contactos (en implementación real)

2. **Alerta de 48 horas** (🔔)
   - Se activa cuando han pasado 48 horas sin check-in
   - Indicador visual naranja
   - Segunda notificación a contactos

3. **Alerta de 72 horas** (🚨)
   - Se activa cuando han pasado 72 horas sin check-in
   - Indicador visual rojo (alerta crítica)
   - Notificación urgente a contactos

### Estado de las Alertas
Cada alerta se muestra en la página principal con:
- Indicador de color (gris = inactiva, color = activada)
- Hora estimada de activación (si no está activa)
- Mensaje "¡Activada!" cuando la alerta está en curso

## 💾 Almacenamiento de Datos

La aplicación utiliza **LocalStorage** del navegador para guardar:
- ✓ Historial de check-ins
- 👥 Lista de contactos de confianza
- 🔔 Estado de las alertas
- 📊 Registro de alertas enviadas

**Importante**: Los datos se guardan localmente en tu navegador, por lo que:
- No se comparten con ningún servidor
- No requieren conexión a internet para funcionar
- Se pierden si borras los datos del navegador
- Son específicos de cada navegador/dispositivo

## 🎨 Diseño y UX

### Paleta de Colores
- **Verde** (`#10B981`): Estado saludable, confirmaciones
- **Azul** (`#3B82F6`): Acciones principales, navegación
- **Amarillo** (`#F59E0B`): Atención, primera alerta
- **Naranja** (`#F59E0B`): Segunda alerta
- **Rojo** (`#EF4444`): Alerta crítica, acciones peligrosas

### Iconos y Símbolos
- ✓ Check-in exitoso
- ⚠️ Alerta de 24 horas
- 🔔 Alerta de 48 horas
- 🚨 Alerta crítica de 72 horas
- 👥 Contactos
- 📅 Historial
- 🔥 Racha

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos con Tailwind CSS
- **JavaScript ES6+**: Lógica de la aplicación
- **LocalStorage API**: Persistencia de datos
- **Notification API**: Notificaciones del navegador (opcional)

## 📝 Funcionalidades Futuras

### En Desarrollo
- [ ] Notificaciones push reales a contactos (requiere backend)
- [ ] Integración con servicios de SMS/Email
- [ ] Sincronización entre dispositivos
- [ ] Aplicación móvil nativa
- [ ] Recordatorios automáticos para hacer check-in

### Mejoras Planificadas
- [ ] Modo oscuro
- [ ] Personalización de intervalos de alerta
- [ ] Exportar historial a CSV/PDF
- [ ] Notas opcionales en cada check-in
- [ ] Modo de emergencia directo

## 🔒 Privacidad y Seguridad

- **Datos locales**: Toda la información se guarda en tu navegador
- **Sin servidor**: No se envía información a ningún servidor externo
- **Sin tracking**: No se rastrean ni analizan tus datos
- **Control total**: Puedes borrar todos tus datos en cualquier momento

### Borrar Todos los Datos

Si deseas borrar completamente todos tus datos:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Application" o "Almacenamiento"
3. En "Local Storage", selecciona tu dominio
4. Elimina todas las entradas que comienzan con "estoyBien"

O ejecuta en la consola:
```javascript
localStorage.clear();
```

## 🤝 Uso Responsable

Esta aplicación está diseñada para:
- ✓ Personas que viven solas y quieren tranquilidad
- ✓ Familias que quieren estar atentas a sus seres queridos
- ✓ Personas mayores que desean mantener contacto diario
- ✓ Cualquiera que busque un sistema simple de bienestar

**Importante**: Esta aplicación NO reemplaza:
- ❌ Servicios de emergencia (911, 112, etc.)
- ❌ Atención médica profesional
- ❌ Sistemas de alarma médica certificados
- ❌ Servicios de teleasistencia profesionales

## 💡 Consejos de Uso

1. **Establece una rutina**: Haz tu check-in a la misma hora cada día
2. **Configura múltiples contactos**: Asegúrate de tener varios contactos de confianza
3. **Verifica los datos**: Asegúrate de que teléfonos y emails sean correctos
4. **Informa a tus contactos**: Explícales cómo funciona el sistema
5. **Usa recordatorios**: Configura una alarma diaria para no olvidar tu check-in

## 🐛 Solución de Problemas

### El check-in no se guarda
- Verifica que tu navegador permita LocalStorage
- Comprueba que no estás en modo incógnito
- Intenta en otro navegador

### Las alertas no se muestran
- Asegúrate de haber realizado al menos un check-in
- Verifica la hora del sistema
- Recarga la página

### No puedo agregar contactos
- Completa todos los campos del formulario
- Usa un formato válido de email
- Verifica que el navegador permita LocalStorage

## 📧 Contacto y Soporte

Esta es una aplicación de código abierto diseñada como herramienta de utilidad social.

## 📜 Licencia

Este proyecto es de código abierto y está disponible para uso personal y educativo.

---

**Estoy Bien** - Ayudando a personas que viven solas a mantenerse conectadas con sus seres queridos.

*Porque un simple "Estoy Bien" puede significar tranquilidad para quienes te importan.* ❤️
