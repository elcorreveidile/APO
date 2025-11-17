# Cómo Probar la Autenticación - Estoy Bien

## 🎯 Pasos Rápidos para Probar

### Paso 1: Configurar MongoDB (Elige una opción)

#### Opción A: MongoDB Atlas (Recomendado - Gratis y Rápido)

1. **Regístrate en MongoDB Atlas:**
   - Ve a: https://www.mongodb.com/cloud/atlas/register
   - Crea una cuenta gratuita

2. **Crea un Cluster:**
   - Haz clic en "Build a Database"
   - Selecciona el plan FREE (M0)
   - Elige la región más cercana
   - Haz clic en "Create Cluster"

3. **Crea un Usuario de Base de Datos:**
   - Ve a "Database Access" en el menú izquierdo
   - Haz clic en "Add New Database User"
   - Usuario: `estoy_bien_user`
   - Contraseña: Genera una segura (guárdala!)
   - Rol: "Read and write to any database"
   - Haz clic en "Add User"

4. **Permite Acceso desde tu IP:**
   - Ve a "Network Access" en el menú izquierdo
   - Haz clic en "Add IP Address"
   - Haz clic en "Allow Access from Anywhere" (0.0.0.0/0)
   - Haz clic en "Confirm"

5. **Obtén tu URI de Conexión:**
   - Ve a "Database" en el menú izquierdo
   - Haz clic en "Connect" en tu cluster
   - Selecciona "Connect your application"
   - Copia la URI (se verá así):
     ```
     mongodb+srv://estoy_bien_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Actualiza el archivo `.env`:**
   - Abre `backend/.env`
   - Comenta la línea de MongoDB local (línea 8):
     ```bash
     # MONGODB_URI=mongodb://localhost:27017/estoy-bien
     ```
   - Descomenta y actualiza la línea de Atlas (línea 11):
     ```bash
     MONGODB_URI=mongodb+srv://estoy_bien_user:TU_PASSWORD@cluster0.xxxxx.mongodb.net/estoy-bien?retryWrites=true&w=majority
     ```
   - **IMPORTANTE:** Reemplaza `TU_PASSWORD` con la contraseña que creaste
   - Reemplaza `cluster0.xxxxx` con tu cluster real

#### Opción B: MongoDB Local (Si ya lo tienes instalado)

Si tienes MongoDB instalado localmente, solo necesitas iniciarlo:

```bash
# En una terminal separada
mongod
```

El `.env` ya está configurado para MongoDB local por defecto.

---

### Paso 2: Iniciar el Backend

```bash
cd backend
npm run dev
```

Deberías ver:
```
✓ Conectado a MongoDB
✓ Servidor corriendo en puerto 5000
```

---

### Paso 3: Probar el Registro de Usuarios

#### Método 1: Usando la Consola del Navegador (Más Fácil)

1. Abre la landing page en tu navegador: http://localhost:8000 (o el puerto que uses)
2. Haz clic en la aplicación "Estoy Bien"
3. Deberías llegar a `estoy-bien-login.html`
4. Busca el enlace de "Registrarse" o crea el archivo de registro si no existe

**Si no existe la página de registro**, usa la consola del navegador:

1. Presiona F12 para abrir DevTools
2. Ve a la pestaña "Console"
3. Ejecuta este código:

```javascript
// Crear una instancia del API
const api = new EstoyBienAPI('http://localhost:5000/api');

// Registrar un nuevo usuario
api.register({
  name: 'Usuario de Prueba',
  email: 'prueba@example.com',
  phone: '+34 600 000 000',
  password: 'password123',
  confirmPassword: 'password123'
}).then(response => {
  console.log('✓ Usuario creado:', response);
}).catch(error => {
  console.error('✗ Error:', error);
});
```

#### Método 2: Usando curl (Terminal)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario de Prueba",
    "email": "prueba@example.com",
    "phone": "+34 600 000 000",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Usuario de Prueba",
    "email": "prueba@example.com",
    "phone": "+34 600 000 000"
  }
}
```

---

### Paso 4: Probar el Login

#### Consola del Navegador:

```javascript
const api = new EstoyBienAPI('http://localhost:5000/api');

api.login({
  email: 'prueba@example.com',
  password: 'password123'
}).then(response => {
  console.log('✓ Login exitoso:', response);
  console.log('Token guardado automáticamente');
}).catch(error => {
  console.error('✗ Error:', error);
});
```

#### curl:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "prueba@example.com",
    "password": "password123"
  }'
```

---

### Paso 5: Verificar que Funciona

#### Obtener tu Perfil (requiere estar logueado):

```javascript
// En la consola del navegador (después del login)
const api = new EstoyBienAPI('http://localhost:5000/api');

api.getProfile().then(profile => {
  console.log('✓ Perfil del usuario:', profile);
}).catch(error => {
  console.error('✗ Error:', error);
});
```

#### curl (usando el token que recibiste):

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 🎨 Crear Página de Registro (Opcional)

Si quieres una interfaz visual para registrarte, puedo crear `estoy-bien-register.html`. Solo dime y la creo.

---

## 🔍 Verificar en la Base de Datos

Si usas MongoDB Atlas, puedes ver los usuarios creados:

1. Ve a tu cluster en MongoDB Atlas
2. Haz clic en "Browse Collections"
3. Verás la base de datos `estoy-bien` → colección `users`
4. Ahí aparecerán los usuarios que registres

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to MongoDB"

- **MongoDB Atlas:** Verifica que:
  - La IP esté en la whitelist (Network Access)
  - El usuario y contraseña sean correctos
  - La URI en `.env` sea correcta

- **MongoDB Local:** Verifica que MongoDB esté corriendo:
  ```bash
  # En otra terminal
  mongod
  ```

### Error: "User already exists"

El email ya está registrado. Usa otro email o usa el login con ese usuario.

### Error: "Network error" o "CORS error"

Verifica que:
1. El backend esté corriendo (`npm run dev`)
2. El frontend esté en uno de los orígenes permitidos en CORS_ORIGIN del `.env`

### No aparece nada en la consola

1. Asegúrate de que `estoy-bien-api.js` esté cargado:
   ```javascript
   // Verifica en la consola
   typeof EstoyBienAPI
   // Debería devolver: "function"
   ```

2. Si no está definido, revisa que el HTML incluya:
   ```html
   <script src="estoy-bien-api.js"></script>
   ```

---

## 📚 Siguientes Pasos

Una vez que el registro y login funcionan:

1. **Crear Check-ins:**
   ```javascript
   api.createCheckIn({
     status: 'ok',
     notes: 'Todo bien por hoy'
   });
   ```

2. **Agregar Contactos:**
   ```javascript
   api.createContact({
     name: 'María García',
     relationship: 'Hermana',
     email: 'maria@example.com',
     phone: '+34 600 111 111'
   });
   ```

3. **Ver Historial:**
   ```javascript
   api.getCheckIns().then(checkins => {
     console.log('Check-ins:', checkins);
   });
   ```

---

## 💡 Consejo

Para desarrollo, te recomiendo instalar la extensión de navegador:
- **JSON Viewer** - Para ver las respuestas del API de forma bonita
- **Thunder Client** (VS Code) o **Postman** - Para probar APIs más fácilmente

---

¿Necesitas ayuda? Revisa:
- `backend/README.md` - Documentación completa del backend
- `ESTOY-BIEN-PRODUCCION.md` - Sistema completo
- `MONGODB-SETUP.md` - Guía detallada de MongoDB
