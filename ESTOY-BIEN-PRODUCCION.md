# Estoy Bien - Versión de Producción Completa

## 🚀 Resumen del Sistema

Has pasado de una aplicación simple basada en LocalStorage a un **sistema de producción completo** con:

- ✅ **Backend Node.js/Express** con API RESTful
- ✅ **Base de datos MongoDB** para almacenamiento persistente
- ✅ **Autenticación JWT** segura
- ✅ **Notificaciones Email** (Nodemailer/SMTP)
- ✅ **Notificaciones SMS** (Twilio)
- ✅ **Push Notifications** (Firebase Cloud Messaging)
- ✅ **Sistema de alertas automático** con cron jobs
- ✅ **Frontend actualizado** con integración completa al backend

---

## 📁 Estructura del Proyecto

```
APO/
├── backend/                          # Backend completo
│   ├── src/
│   │   ├── models/                   # Modelos de MongoDB
│   │   │   ├── User.js              # Usuario con autenticación
│   │   │   ├── Contact.js           # Contactos de confianza
│   │   │   ├── CheckIn.js           # Check-ins diarios
│   │   │   └── Alert.js             # Sistema de alertas
│   │   ├── controllers/              # Lógica de negocio
│   │   │   ├── authController.js    # Registro, login, perfil
│   │   │   ├── checkInController.js # Gestión de check-ins
│   │   │   ├── contactController.js # Gestión de contactos
│   │   │   └── alertController.js   # Gestión de alertas
│   │   ├── routes/                   # Rutas de la API
│   │   │   ├── auth.js
│   │   │   ├── checkins.js
│   │   │   ├── contacts.js
│   │   │   └── alerts.js
│   │   ├── services/                 # Servicios externos
│   │   │   ├── emailService.js      # Envío de emails
│   │   │   ├── smsService.js        # Envío de SMS
│   │   │   ├── pushService.js       # Push notifications
│   │   │   └── alertService.js      # Coordinador de alertas
│   │   ├── middleware/               # Middleware personalizado
│   │   │   ├── auth.js              # Autenticación JWT
│   │   │   ├── validation.js        # Validación de datos
│   │   │   └── errorHandler.js      # Manejo de errores
│   │   ├── config/
│   │   │   └── database.js          # Conexión a MongoDB
│   │   └── utils/
│   │       └── logger.js            # Sistema de logging
│   ├── .env.example                  # Plantilla de configuración
│   ├── .gitignore
│   ├── package.json                  # Dependencias del backend
│   ├── server.js                     # Punto de entrada
│   └── README.md                     # Documentación del backend
│
├── Frontend (archivos actualizados):
│   ├── estoy-bien.html              # Página principal (actualizada)
│   ├── estoy-bien-login.html        # Nueva: Login de usuarios
│   ├── estoy-bien-register.html     # Nueva: Registro de usuarios
│   ├── estoy-bien-contactos.html    # Gestión de contactos (actualizada)
│   ├── estoy-bien-historial.html    # Historial (actualizado)
│   ├── estoy-bien-api.js            # Nuevo: Cliente API
│   └── estoy-bien.js                # JavaScript original (modo offline)
│
└── ESTOY-BIEN-README.md             # Documentación de la app original
└── ESTOY-BIEN-PRODUCCION.md         # Este archivo
```

---

## 🔥 Instalación y Configuración

### Paso 1: Configurar el Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus credenciales (ver más abajo)
nano .env
```

### Paso 2: Configurar Variables de Entorno

Edita el archivo `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB - Usa una de estas opciones:
# Opción 1: MongoDB local
MONGODB_URI=mongodb://localhost:27017/estoy-bien

# Opción 2: MongoDB Atlas (recomendado para producción)
# MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/estoy-bien

# JWT
JWT_SECRET=cambia_esto_por_un_secret_muy_seguro_y_aleatorio
JWT_EXPIRE=7d

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password_de_gmail
EMAIL_FROM=Estoy Bien <noreply@estoy-bien.app>

# Twilio SMS
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Firebase Cloud Messaging
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8000,http://127.0.0.1:8000

# Alert Check (cada cuántos minutos verificar alertas)
ALERT_CHECK_INTERVAL=1
```

### Paso 3: Configurar Servicios Externos

#### MongoDB Atlas (Recomendado)

1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratuita
3. Crea un cluster gratuito (M0)
4. Crea un usuario de base de datos
5. Agrega tu IP a la whitelist (o usa 0.0.0.0/0 para desarrollo)
6. Obtén la connection string y agrégala a `.env`

#### Gmail (Para Emails)

1. Habilita verificación en 2 pasos en tu cuenta de Gmail
2. Ve a https://myaccount.google.com/apppasswords
3. Genera una contraseña de aplicación para "Mail"
4. Usa esa contraseña en `EMAIL_PASSWORD`

#### Twilio (Para SMS)

1. Crea cuenta en https://www.twilio.com
2. Verifica tu número de teléfono
3. Obtén Account SID y Auth Token del dashboard
4. Compra un número de teléfono Twilio (o usa el de prueba)
5. Agregar los datos a `.env`

**Nota:** En modo de prueba de Twilio, solo puedes enviar SMS a números verificados.

#### Firebase (Para Push Notifications)

1. Ve a https://console.firebase.google.com
2. Crea un nuevo proyecto
3. Ve a Project Settings > Service Accounts
4. Genera una nueva clave privada (descarga el JSON)
5. Copia los valores del JSON a `.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

### Paso 4: Iniciar MongoDB (si usas local)

```bash
# En otra terminal
mongod
```

### Paso 5: Iniciar el Backend

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El backend estará corriendo en `http://localhost:5000`

### Paso 6: Configurar el Frontend

Actualiza `estoy-bien-api.js` con la URL de tu backend:

```javascript
// Para desarrollo local:
const api = new EstoyBienAPI('http://localhost:5000/api');

// Para producción:
// const api = new EstoyBienAPI('https://tu-dominio.com/api');
```

### Paso 7: Servir el Frontend

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js http-server
npx http-server -p 8000

# Opción 3: PHP
php -S localhost:8000
```

Abre tu navegador en `http://localhost:8000/estoy-bien-register.html`

---

## 🎯 Flujo de Usuario

### 1. Registro de Nuevo Usuario

1. El usuario visita `estoy-bien-register.html`
2. Completa el formulario con:
   - Nombre completo
   - Email
   - Teléfono
   - Contraseña (mínimo 6 caracteres)
3. El sistema:
   - Crea la cuenta en MongoDB
   - Hashea la contraseña con bcrypt
   - Envía email de bienvenida
   - Genera token JWT
   - Redirige a la página principal

### 2. Login

1. Usuario visita `estoy-bien-login.html`
2. Ingresa email y contraseña
3. El sistema:
   - Verifica credenciales
   - Genera token JWT (válido 7 días)
   - Almacena token en localStorage
   - Redirige a página principal

### 3. Check-in Diario

1. Usuario hace clic en "Reportar Estoy Bien"
2. El sistema:
   - Envía POST a `/api/checkins`
   - Guarda en MongoDB con timestamp
   - Actualiza `lastCheckIn` del usuario
   - Resuelve cualquier alerta activa
   - Opcionalmente envía confirmación por email/push

### 4. Gestión de Contactos

1. Usuario agrega contactos de confianza
2. Para cada contacto especifica:
   - Nombre, teléfono, email, relación
   - Preferencias de notificación (email, SMS, push)
   - Prioridad (1-3)

### 5. Sistema de Alertas Automático

#### Cómo Funciona

El backend ejecuta un **cron job cada minuto** que:

1. Obtiene todos los usuarios activos
2. Para cada usuario, verifica:
   - Si tiene `lastCheckIn`
   - Cuánto tiempo ha pasado desde el último check-in
3. Si han pasado 24h, 48h o 72h:
   - Crea una alerta en la base de datos
   - Obtiene todos los contactos activos del usuario
   - Envía notificaciones según preferencias:
     - **Email**: Con información completa del usuario
     - **SMS**: Mensaje conciso con datos de contacto
     - **Push**: Notificación a la app móvil (si está instalada)
4. Registra el resultado de cada notificación

#### Niveles de Alerta

- **24 horas** (⚠️ Warning):
  - Color: Amarillo
  - Mensaje: "Atención"
  - Prioridad: Media

- **48 horas** (🔔 Alert):
  - Color: Naranja
  - Mensaje: "Alerta"
  - Prioridad: Alta

- **72 horas** (🚨 Critical):
  - Color: Rojo
  - Mensaje: "Alerta Crítica"
  - Prioridad: Urgente

#### Resolución de Alertas

Las alertas se resuelven automáticamente cuando:
- El usuario hace un nuevo check-in
- Se marca manualmente como resuelta

---

## 📡 API Endpoints

### Autenticación

```javascript
// Registro
POST /api/auth/register
Body: { name, email, phone, password }

// Login
POST /api/auth/login
Body: { email, password }

// Obtener perfil actual
GET /api/auth/me
Headers: { Authorization: "Bearer <token>" }

// Actualizar perfil
PUT /api/auth/updatedetails
Headers: { Authorization: "Bearer <token>" }
Body: { name, phone, address, emergencyInfo, ... }

// Cambiar contraseña
PUT /api/auth/updatepassword
Headers: { Authorization: "Bearer <token>" }
Body: { currentPassword, newPassword }

// Actualizar token FCM (para push)
PUT /api/auth/fcmtoken
Headers: { Authorization: "Bearer <token>" }
Body: { fcmToken }
```

### Check-ins

```javascript
// Crear check-in
POST /api/checkins
Headers: { Authorization: "Bearer <token>" }
Body: { notes?, mood?, location? }

// Obtener todos los check-ins
GET /api/checkins?page=1&limit=20&startDate=2024-01-01
Headers: { Authorization: "Bearer <token>" }

// Obtener estadísticas
GET /api/checkins/stats?days=30
Headers: { Authorization: "Bearer <token>" }

// Obtener un check-in específico
GET /api/checkins/:id
Headers: { Authorization: "Bearer <token>" }

// Eliminar check-in
DELETE /api/checkins/:id
Headers: { Authorization: "Bearer <token>" }
```

### Contactos

```javascript
// Crear contacto
POST /api/contacts
Headers: { Authorization: "Bearer <token>" }
Body: {
  name, phone, email, relation,
  priority?, notificationPreferences?
}

// Obtener todos los contactos
GET /api/contacts
Headers: { Authorization: "Bearer <token>" }

// Actualizar contacto
PUT /api/contacts/:id
Headers: { Authorization: "Bearer <token>" }
Body: { name?, phone?, ... }

// Eliminar contacto (soft delete)
DELETE /api/contacts/:id
Headers: { Authorization: "Bearer <token>" }
```

### Alertas

```javascript
// Obtener todas las alertas
GET /api/alerts?page=1&limit=20&status=sent&level=24h
Headers: { Authorization: "Bearer <token>" }

// Obtener alertas activas
GET /api/alerts/active
Headers: { Authorization: "Bearer <token>" }

// Obtener estadísticas de alertas
GET /api/alerts/stats?days=30
Headers: { Authorization: "Bearer <token>" }

// Resolver alerta manualmente
PUT /api/alerts/:id/resolve
Headers: { Authorization: "Bearer <token>" }

// Forzar verificación de alertas (testing)
POST /api/alerts/check
Headers: { Authorization: "Bearer <token>" }
```

---

## 🔒 Seguridad Implementada

- ✅ **Passwords hasheados** con bcrypt (salt rounds: 10)
- ✅ **JWT tokens** con expiración configurable
- ✅ **Helmet.js** para headers de seguridad HTTP
- ✅ **Rate limiting** (100 requests por 15 min por defecto)
- ✅ **CORS** configurado para dominios específicos
- ✅ **Validación de inputs** con express-validator
- ✅ **Sanitización de datos** automática
- ✅ **Autenticación obligatoria** en rutas protegidas
- ✅ **Soft deletes** (no se eliminan datos, se marcan como inactivos)
- ✅ **Logging completo** de operaciones y errores

---

## 📊 Base de Datos

### Modelos de MongoDB

#### User (Usuario)
```javascript
{
  name: String,
  email: String (unique, lowercase),
  phone: String,
  password: String (hashed),
  dateOfBirth: Date,
  address: {
    street, city, state, zipCode, country
  },
  emergencyInfo: {
    medicalConditions: [String],
    medications: [String],
    allergies: [String],
    bloodType: String
  },
  fcmToken: String (para push notifications),
  isActive: Boolean,
  lastCheckIn: Date,
  checkInStreak: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Contact (Contacto)
```javascript
{
  user: ObjectId (ref: User),
  name: String,
  phone: String,
  email: String,
  relation: Enum (Familiar, Amigo/a, Vecino/a, Compañero/a, Otro),
  priority: Number (1-3),
  notificationPreferences: {
    email: Boolean,
    sms: Boolean,
    push: Boolean
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### CheckIn
```javascript
{
  user: ObjectId (ref: User),
  timestamp: Date,
  location: {
    type: 'Point',
    coordinates: [Number],
    address: String
  },
  notes: String,
  mood: Enum (excelente, bien, regular, mal),
  deviceInfo: String,
  ipAddress: String,
  createdAt: Date
}
```

#### Alert (Alerta)
```javascript
{
  user: ObjectId (ref: User),
  level: Enum ('24h', '48h', '72h'),
  triggeredAt: Date,
  status: Enum (pending, sent, failed, resolved),
  lastCheckInAt: Date,
  hoursSinceCheckIn: Number,
  notificationsSent: [{
    contact: ObjectId (ref: Contact),
    method: Enum (email, sms, push),
    status: Enum (sent, failed, pending),
    sentAt: Date,
    error: String
  }],
  resolvedAt: Date,
  resolvedBy: Enum (user_checkin, manual, system),
  notes: String,
  createdAt: Date
}
```

---

## 🚀 Deployment en Producción

### Opción 1: Heroku

```bash
# Instalar Heroku CLI y hacer login
heroku login

# Crear app
cd backend
heroku create estoy-bien-api

# Agregar MongoDB
heroku addons:create mongolab:sandbox

# Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu_secret_super_seguro
heroku config:set EMAIL_USER=tu_email@gmail.com
heroku config:set EMAIL_PASSWORD=tu_app_password
heroku config:set TWILIO_ACCOUNT_SID=tu_sid
heroku config:set TWILIO_AUTH_TOKEN=tu_token
heroku config:set TWILIO_PHONE_NUMBER=+1234567890
heroku config:set FIREBASE_PROJECT_ID=tu_proyecto
heroku config:set FIREBASE_CLIENT_EMAIL=tu_email@proyecto.iam.gserviceaccount.com
heroku config:set "FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----..."
heroku config:set CORS_ORIGIN=https://tu-frontend.com

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

### Opción 2: DigitalOcean/AWS/GCP

1. **Crear servidor Ubuntu**
2. **Instalar Node.js y MongoDB**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo apt-get install -y mongodb
   ```

3. **Clonar el repositorio**
   ```bash
   git clone tu-repo.git
   cd backend
   npm install --production
   ```

4. **Configurar variables de entorno**
   ```bash
   nano .env
   # Agregar todas las variables
   ```

5. **Configurar PM2** (process manager)
   ```bash
   npm install -g pm2
   pm2 start server.js --name estoy-bien-api
   pm2 startup
   pm2 save
   ```

6. **Configurar Nginx** (reverse proxy)
   ```nginx
   server {
       listen 80;
       server_name api.estoy-bien.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Configurar SSL** (Let's Encrypt)
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.estoy-bien.com
   ```

### Frontend (Vercel/Netlify)

```bash
# Opción 1: Vercel
npx vercel

# Opción 2: Netlify
npx netlify-cli deploy
```

Actualiza `estoy-bien-api.js`:
```javascript
const api = new EstoyBienAPI('https://api.estoy-bien.com/api');
```

---

## 📈 Monitoreo y Logs

### Ver logs en desarrollo
```bash
# Los logs se muestran en consola con colores
```

### Ver logs en producción
```bash
# Logs se guardan en archivos
tail -f backend/logs/combined.log
tail -f backend/logs/error.log
```

### Configurar alertas de monitoreo

Recomendaciones:
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry
- **APM**: New Relic, DataDog
- **Logs**: LogDNA, Papertrail

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Probar endpoint de registro
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+34600123456",
    "password": "test123"
  }'
```

### Probar check-in
```bash
# Primero obten el token del registro/login
TOKEN="tu_token_jwt_aqui"

curl -X POST http://localhost:5000/api/checkins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "notes": "Me siento bien",
    "mood": "bien"
  }'
```

---

## 🔧 Solución de Problemas

### El backend no inicia

1. **Verifica que MongoDB esté corriendo**
   ```bash
   mongod --version
   # Si no está corriendo: mongod
   ```

2. **Verifica las variables de entorno**
   ```bash
   cat backend/.env
   # Asegúrate de que todas estén configuradas
   ```

3. **Verifica los logs**
   ```bash
   npm run dev
   # Lee los mensajes de error
   ```

### No se envían emails

1. **Verifica credenciales de Gmail**
   - Asegúrate de usar App Password, no tu contraseña normal
   - Verifica que 2FA esté habilitado

2. **Verifica logs**
   ```bash
   # Busca errores de email en los logs
   tail -f backend/logs/combined.log | grep email
   ```

### No se envían SMS

1. **Verifica créditos de Twilio**
   - Revisa tu dashboard de Twilio
   - En modo trial, solo puedes enviar a números verificados

2. **Verifica configuración**
   ```bash
   # Asegúrate de que las variables estén correctas
   echo $TWILIO_ACCOUNT_SID
   echo $TWILIO_AUTH_TOKEN
   echo $TWILIO_PHONE_NUMBER
   ```

### Alertas no se disparan

1. **Verifica el cron job**
   ```bash
   # Los logs mostrarán: "Running scheduled alert check..."
   # Cada minuto debería aparecer este mensaje
   ```

2. **Fuerza una verificación manual**
   ```bash
   curl -X POST http://localhost:5000/api/alerts/check \
     -H "Authorization: Bearer $TOKEN"
   ```

---

## 🎓 Próximos Pasos Sugeridos

### Mejoras de Producto
- [ ] App móvil nativa (React Native / Flutter)
- [ ] Integración con wearables (Apple Watch, Fitbit)
- [ ] Check-in por voz (Alexa, Google Home)
- [ ] Geofencing (alerta si el usuario sale de una zona)
- [ ] Modo de emergencia con botón de pánico

### Mejoras Técnicas
- [ ] Tests unitarios y de integración (Jest)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Documentación Swagger/OpenAPI
- [ ] WebSockets para notificaciones en tiempo real
- [ ] GraphQL API además de REST
- [ ] Caché con Redis
- [ ] Queue system para notificaciones (Bull/RabbitMQ)

### Características Premium
- [ ] Múltiples usuarios/familia
- [ ] Reportes y analytics
- [ ] Integración con servicios médicos
- [ ] SOS con llamada automática a emergencias
- [ ] Videollamada de verificación

---

## ✅ Checklist de Deployment

Antes de poner en producción, verifica:

- [ ] Todas las variables de entorno están configuradas
- [ ] JWT_SECRET es fuerte y único
- [ ] MongoDB está en MongoDB Atlas (no local)
- [ ] CORS está configurado solo para tu dominio
- [ ] HTTPS/SSL está configurado
- [ ] Emails se envían correctamente
- [ ] SMS se envían correctamente (si está activado)
- [ ] Push notifications funcionan (si está activado)
- [ ] Rate limiting está activo
- [ ] Logs están configurados
- [ ] Backup automático de MongoDB configurado
- [ ] Monitoreo de uptime configurado
- [ ] Dominio personalizado configurado
- [ ] Documentación actualizada

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la documentación en:
   - `backend/README.md` - Documentación del backend
   - `ESTOY-BIEN-README.md` - Documentación de la app original

2. Revisa los logs:
   ```bash
   # Backend
   tail -f backend/logs/combined.log

   # Navegador (Frontend)
   # Abre DevTools (F12) y revisa la consola
   ```

3. Verifica la salud del sistema:
   ```bash
   curl http://localhost:5000/health
   ```

---

## 📄 Licencia

MIT

---

**¡Felicidades!** Has convertido una simple app de check-in en un **sistema de producción completo y robusto** que puede salvar vidas. 🎉

El sistema ahora está listo para:
- Usuarios reales
- Notificaciones automáticas
- Almacenamiento persistente
- Escalabilidad
- Deployment en la nube

**Estoy Bien** - Manteniendo a las personas conectadas y seguras. ❤️
