# Estoy Bien - Backend API

Backend completo para la aplicación "Estoy Bien" - Sistema de check-in diario con notificaciones automáticas.

## 🚀 Características

- **Autenticación JWT** - Sistema seguro de login y registro
- **Base de datos MongoDB** - Almacenamiento persistente y escalable
- **Notificaciones Email** - Vía Nodemailer/SMTP
- **Notificaciones SMS** - Integración con Twilio
- **Push Notifications** - Firebase Cloud Messaging
- **Alertas automáticas** - Sistema cron que verifica check-ins cada minuto
- **API RESTful** - Endpoints bien documentados
- **Rate limiting** - Protección contra abuso
- **Logging completo** - Winston para logs de producción

## 📋 Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB >= 6.0 (local o Atlas)
- Cuenta de Twilio (para SMS)
- Cuenta de Firebase (para push notifications)
- Servidor SMTP o Gmail (para emails)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/estoy-bien

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRE=7d

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
EMAIL_FROM=Estoy Bien <noreply@estoy-bien.app>

# Twilio
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Firebase
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8000
```

### 3. Iniciar MongoDB

Si usas MongoDB local:

```bash
mongod
```

O usa MongoDB Atlas (cloud) configurando la URL en `.env`.

### 4. Iniciar el servidor

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

El servidor estará corriendo en `http://localhost:5000`

## 📡 API Endpoints

### Autenticación

| Method | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/me` | Obtener perfil del usuario | Sí |
| PUT | `/api/auth/updatedetails` | Actualizar perfil | Sí |
| PUT | `/api/auth/updatepassword` | Cambiar contraseña | Sí |
| PUT | `/api/auth/fcmtoken` | Actualizar token FCM | Sí |
| DELETE | `/api/auth/deleteaccount` | Desactivar cuenta | Sí |

### Check-ins

| Method | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/checkins` | Crear check-in | Sí |
| GET | `/api/checkins` | Obtener todos los check-ins | Sí |
| GET | `/api/checkins/stats` | Estadísticas de check-ins | Sí |
| GET | `/api/checkins/:id` | Obtener un check-in | Sí |
| DELETE | `/api/checkins/:id` | Eliminar check-in | Sí |

### Contactos

| Method | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/contacts` | Crear contacto | Sí |
| GET | `/api/contacts` | Obtener todos los contactos | Sí |
| GET | `/api/contacts/:id` | Obtener un contacto | Sí |
| PUT | `/api/contacts/:id` | Actualizar contacto | Sí |
| DELETE | `/api/contacts/:id` | Eliminar contacto | Sí |

### Alertas

| Method | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/alerts` | Obtener todas las alertas | Sí |
| GET | `/api/alerts/active` | Obtener alertas activas | Sí |
| GET | `/api/alerts/stats` | Estadísticas de alertas | Sí |
| GET | `/api/alerts/:id` | Obtener una alerta | Sí |
| PUT | `/api/alerts/:id/resolve` | Resolver alerta manualmente | Sí |
| POST | `/api/alerts/check` | Forzar verificación de alertas | Sí |

## 🔐 Autenticación

Todas las rutas protegidas requieren un token JWT en el header:

```javascript
Authorization: Bearer <token>
```

### Ejemplo de registro:

```javascript
POST /api/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+34600123456",
  "password": "securepassword123"
}
```

Respuesta:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    ...
  }
}
```

### Ejemplo de check-in:

```javascript
POST /api/checkins
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Me siento bien hoy",
  "mood": "bien",
  "location": {
    "coordinates": [-3.7038, 40.4168],
    "address": "Madrid, España"
  }
}
```

## 🔔 Sistema de Alertas

El backend incluye un sistema automático de alertas que verifica cada minuto si los usuarios necesitan alertas:

- **24h**: Primera alerta - Contactos reciben notificación de atención
- **48h**: Segunda alerta - Contactos reciben alerta más urgente
- **72h**: Alerta crítica - Contactos reciben alerta de emergencia

### Configuración del intervalo:

Edita en `.env`:
```env
ALERT_CHECK_INTERVAL=1  # Minutos entre verificaciones
```

### Cómo funciona:

1. El cron job ejecuta `alertService.checkAllUsers()` cada N minutos
2. Para cada usuario, verifica el tiempo desde el último check-in
3. Si cumple los criterios (24h, 48h, 72h), crea una alerta
4. Envía notificaciones a todos los contactos activos vía:
   - Email (si está habilitado)
   - SMS (si está habilitado)
   - Push (si el contacto tiene la app)

## 📧 Configuración de Servicios Externos

### Gmail (Email)

1. Habilita "2-Step Verification" en tu cuenta de Gmail
2. Genera una "App Password":
   - Ve a https://myaccount.google.com/security
   - Busca "App passwords"
   - Genera una contraseña para "Mail"
3. Usa esa contraseña en `EMAIL_PASSWORD`

### Twilio (SMS)

1. Crea una cuenta en https://www.twilio.com
2. Obtén tu Account SID y Auth Token del dashboard
3. Compra un número de teléfono Twilio
4. Configura las variables en `.env`

### Firebase (Push Notifications)

1. Crea un proyecto en https://console.firebase.google.com
2. Ve a Project Settings > Service Accounts
3. Genera una nueva clave privada (JSON)
4. Copia los valores al `.env`:
   ```env
   FIREBASE_PROJECT_ID=tu-proyecto-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@tu-proyecto.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

## 🗂️ Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de MongoDB
│   ├── controllers/
│   │   ├── authController.js    # Lógica de autenticación
│   │   ├── checkInController.js # Lógica de check-ins
│   │   ├── contactController.js # Lógica de contactos
│   │   └── alertController.js   # Lógica de alertas
│   ├── middleware/
│   │   ├── auth.js              # Middleware de autenticación
│   │   ├── validation.js        # Validación de requests
│   │   └── errorHandler.js      # Manejo de errores
│   ├── models/
│   │   ├── User.js              # Modelo de usuario
│   │   ├── Contact.js           # Modelo de contacto
│   │   ├── CheckIn.js           # Modelo de check-in
│   │   └── Alert.js             # Modelo de alerta
│   ├── routes/
│   │   ├── auth.js              # Rutas de autenticación
│   │   ├── checkins.js          # Rutas de check-ins
│   │   ├── contacts.js          # Rutas de contactos
│   │   └── alerts.js            # Rutas de alertas
│   ├── services/
│   │   ├── emailService.js      # Servicio de emails
│   │   ├── smsService.js        # Servicio de SMS
│   │   ├── pushService.js       # Servicio de push notifications
│   │   └── alertService.js      # Coordinador de alertas
│   └── utils/
│       └── logger.js            # Sistema de logging
├── .env.example                 # Plantilla de variables de entorno
├── .gitignore
├── package.json
├── server.js                    # Punto de entrada
└── README.md
```

## 🧪 Testing

```bash
npm test
```

## 📊 Logging

Los logs se guardan en:
- Desarrollo: Solo consola
- Producción: `logs/combined.log` y `logs/error.log`

Niveles de log: `error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`

## 🚀 Deployment

### Heroku

```bash
heroku create estoy-bien-api
heroku addons:create mongolab:sandbox
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu_secret
# ... otras variables de entorno
git push heroku main
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Variables de entorno en producción

Asegúrate de configurar todas las variables en tu plataforma de deployment:
- Heroku: `heroku config:set VAR=value`
- Vercel/Netlify: En el dashboard
- AWS/GCP: En el servicio correspondiente

## 🔒 Seguridad

- ✅ Passwords hasheados con bcrypt
- ✅ JWT para autenticación
- ✅ Helmet.js para headers de seguridad
- ✅ Rate limiting para prevenir abuse
- ✅ CORS configurado
- ✅ Validación de inputs
- ✅ Sanitización de datos

## 📝 Notas Importantes

- Nunca commitas el archivo `.env`
- Cambia `JWT_SECRET` en producción
- Usa HTTPS en producción
- Configura un dominio real para emails en producción
- Monitorea los logs regularmente
- Implementa backups de la base de datos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT

## 👥 Soporte

Para problemas o preguntas, abre un issue en GitHub.

---

**Estoy Bien Backend API** - Manteniendo a las personas conectadas y seguras.
