# 🚀 Inicio Rápido - Estoy Bien

Guía rápida para poner en marcha la aplicación "Estoy Bien" en **5 minutos**.

## ⚡ Pasos Rápidos

### 1️⃣ Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### 2️⃣ Ejecutar Diagnóstico

```bash
npm run diagnose
```

Este comando verifica:
- ✅ Versión de Node.js
- ✅ Archivo .env configurado
- ✅ Dependencias instaladas
- ✅ Conexión a MongoDB

### 3️⃣ Configurar MongoDB

**Opción A: MongoDB Atlas (Cloud - GRATIS - RECOMENDADO)**

1. Ve a: https://www.mongodb.com/cloud/atlas/register
2. Crea cuenta (gratis, sin tarjeta)
3. Crea cluster M0 (gratis)
4. Crea usuario de base de datos
5. Agrega IP `0.0.0.0/0` (Network Access)
6. Copia connection string
7. Pega en `.env`:

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/estoy-bien?retryWrites=true&w=majority
```

**Opción B: MongoDB Local**

```bash
# El .env ya viene configurado con:
MONGODB_URI=mongodb://localhost:27017/estoy-bien

# Solo necesitas tener MongoDB corriendo localmente
mongod
```

**Guía detallada:** [backend/MONGODB-SETUP.md](backend/MONGODB-SETUP.md)

### 4️⃣ Verificar Configuración

```bash
npm run diagnose
```

Deberías ver:
```
✓ Node.js v18.x.x (✓ Compatible)
✓ .env existe
✓ MONGODB_URI: mongodb+srv://...
✓ Conexión exitosa a MongoDB
✓ Todo configurado correctamente! 🎉
```

### 5️⃣ Poblar Base de Datos (Opcional)

```bash
npm run db:seed
```

Esto crea:
- 4 usuarios de prueba
- 8 contactos
- ~100 check-ins
- 2 alertas activas

**Credenciales de prueba:**
- Email: `juan@example.com`
- Password: `password123`

### 6️⃣ Iniciar el Backend

```bash
npm run dev
```

Deberías ver:
```
✓ MongoDB Connected: cluster0.mongodb.net
✓ Server running in development mode on port 5000
✓ Alert check scheduled: every 1 minute(s)
```

### 7️⃣ Iniciar el Frontend

En **otra terminal**:

```bash
# Desde la raíz del proyecto (no desde backend/)
cd ..

# Opción Python
python -m http.server 8000

# Opción Node.js
npx http-server -p 8000
```

### 8️⃣ Abrir la Aplicación

Visita: **http://localhost:8000**

Verás la landing page con dos apps:
- **Estoy Bien** (clic para acceder)
- **SpanishFlow**

---

## 📋 Checklist de Verificación

Antes de usar la app, verifica que todo esté bien:

- [ ] Backend corriendo en puerto 5000
- [ ] Frontend corriendo en puerto 8000
- [ ] MongoDB conectado (ver logs del backend)
- [ ] Sin errores en consola del backend
- [ ] Navegador abierto en http://localhost:8000

---

## 🐛 Solución Rápida de Problemas

### ❌ "npm install" falla

```bash
# Limpia cache e intenta de nuevo
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### ❌ "Error connecting to MongoDB"

```bash
# Verifica el .env
cat .env | grep MONGODB_URI

# Prueba la conexión
npm run db:test
```

**Errores comunes:**
- Usuario/password incorrectos → Verifica en MongoDB Atlas
- IP no autorizada → Agrega `0.0.0.0/0` en Network Access
- MongoDB local no corriendo → Ejecuta `mongod`

### ❌ "Port 5000 already in use"

```bash
# Cambia el puerto en .env
PORT=5001

# O mata el proceso
lsof -ti:5000 | xargs kill -9
```

### ❌ "Cannot register user" en el frontend

1. **Verifica que el backend esté corriendo:**
   - Deberías ver logs en la terminal del backend
   - Visita: http://localhost:5000/health
   - Debería mostrar: `{"success":true,"message":"API is running"}`

2. **Verifica la consola del navegador (F12):**
   - ¿Hay errores de CORS?
   - ¿Hay errores de red?

3. **Verifica la URL en el frontend:**
   - Abre: `estoy-bien-api.js`
   - Línea 7: `baseURL = 'http://localhost:5000/api'`
   - Debe coincidir con el puerto del backend

### ❌ "CORS error"

Edita `backend/.env`:
```env
CORS_ORIGIN=http://localhost:8000,http://127.0.0.1:8000
```

Reinicia el backend.

---

## 🎯 Comandos Útiles

```bash
# Backend
npm run dev          # Iniciar servidor (con auto-reload)
npm run diagnose     # Verificar configuración
npm run db:test      # Probar conexión a MongoDB
npm run db:seed      # Poblar con datos de prueba
npm run db:reset     # Resetear datos (sin confirmación)

# Logs
tail -f logs/combined.log    # Ver logs en producción
```

---

## 📚 Documentación Completa

- **MongoDB:** [backend/MONGODB-SETUP.md](backend/MONGODB-SETUP.md)
- **Backend API:** [backend/README.md](backend/README.md)
- **Sistema Completo:** [ESTOY-BIEN-PRODUCCION.md](ESTOY-BIEN-PRODUCCION.md)
- **App Original:** [ESTOY-BIEN-README.md](ESTOY-BIEN-README.md)

---

## ✅ Listo para Producción

Una vez que todo funcione localmente:

1. **Configurar servicios (opcional):**
   - Email (Gmail): Para notificaciones por correo
   - Twilio (SMS): Para notificaciones por SMS
   - Firebase: Para push notifications

2. **Deploy:**
   - Backend: Heroku, DigitalOcean, AWS
   - Frontend: Vercel, Netlify, GitHub Pages
   - Ver: [ESTOY-BIEN-PRODUCCION.md](ESTOY-BIEN-PRODUCCION.md)

---

## 🆘 ¿Necesitas Ayuda?

1. Ejecuta el diagnóstico:
   ```bash
   cd backend
   npm run diagnose
   ```

2. Revisa los logs del backend

3. Revisa la consola del navegador (F12)

4. Lee la documentación detallada en los links de arriba

---

**¡Listo!** En 5 minutos deberías tener la app corriendo. 🎉

Si hay problemas, el comando `npm run diagnose` te dirá exactamente qué falta configurar.
