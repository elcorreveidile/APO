# Scripts de Base de Datos

Esta carpeta contiene scripts útiles para gestionar la base de datos MongoDB.

## 📜 Scripts Disponibles

### 1. `test-db.js` - Verificar Conexión

Prueba la conexión a MongoDB y muestra información de la base de datos.

**Uso:**
```bash
cd backend
node scripts/test-db.js
```

**Muestra:**
- ✅ Estado de la conexión
- 📊 Host y nombre de la base de datos
- 📁 Colecciones existentes
- 🔢 Número de documentos por colección

**Útil para:**
- Verificar que la configuración es correcta
- Diagnosticar problemas de conexión
- Ver el estado actual de la base de datos

---

### 2. `seed.js` - Poblar con Datos de Prueba

Crea datos de prueba en la base de datos para desarrollo.

**⚠️ IMPORTANTE:** Este script **ELIMINA TODOS LOS DATOS** existentes.

**Uso:**
```bash
cd backend
node scripts/seed.js
```

**Con confirmación automática (para CI/CD):**
```bash
node scripts/seed.js --force
```

**Datos creados:**
- 👥 **4 usuarios** de prueba
- 📞 **8 contactos** de confianza
- ✅ **~100 check-ins** de los últimos 30 días
- 🚨 **2 alertas** activas

**Credenciales de prueba:**
```
Email: juan@example.com
Password: password123

Email: maria@example.com
Password: password123

Email: antonio@example.com
Password: password123

Email: carmen@example.com
Password: password123
```

**Escenarios incluidos:**
- Usuario con check-in reciente (< 24h)
- Usuario con alerta 24h activa
- Usuario con alerta 48h activa
- Usuarios con diferentes rachas de check-ins

---

## 🚀 Flujo de Trabajo Recomendado

### Primera vez configurando:

```bash
# 1. Verificar conexión
node scripts/test-db.js

# 2. Si la conexión es exitosa, poblar con datos
node scripts/seed.js

# 3. Iniciar el servidor
npm run dev
```

### Durante desarrollo:

```bash
# Resetear datos de prueba
node scripts/seed.js --force

# Verificar estado de la BD
node scripts/test-db.js
```

---

## 🛠️ Crear tus propios scripts

Puedes crear scripts adicionales en esta carpeta. Ejemplo:

```javascript
// scripts/mi-script.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function miScript() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Tu lógica aquí
  const users = await User.find({});
  console.log(`Total usuarios: ${users.length}`);

  await mongoose.connection.close();
}

miScript();
```

---

## 📊 NPM Scripts

Puedes agregar estos scripts a `package.json` para facilitar su uso:

```json
{
  "scripts": {
    "db:test": "node scripts/test-db.js",
    "db:seed": "node scripts/seed.js",
    "db:reset": "node scripts/seed.js --force"
  }
}
```

Luego usar:
```bash
npm run db:test
npm run db:seed
npm run db:reset
```

---

## 🔍 Solución de Problemas

### Error: "Cannot find module 'dotenv'"

```bash
npm install
```

### Error: "MONGODB_URI is not defined"

Asegúrate de que:
1. El archivo `.env` existe en `backend/`
2. Contiene: `MONGODB_URI=mongodb+srv://...`
3. Estás ejecutando desde la carpeta `backend/`

### Script no hace nada

Verifica que estás ejecutando desde la carpeta correcta:
```bash
pwd
# Debería mostrar: .../backend
```

---

## 🆘 Ayuda

Si tienes problemas, consulta:
- `MONGODB-SETUP.md` - Guía completa de configuración de MongoDB
- `README.md` - Documentación general del backend

O ejecuta el test de conexión para diagnóstico:
```bash
node scripts/test-db.js
```
