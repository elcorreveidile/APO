# Guía de Configuración de Base de Datos MongoDB

## 🚀 Opción 1: MongoDB Atlas (Cloud - RECOMENDADO)

MongoDB Atlas es el servicio cloud oficial de MongoDB. **Es GRATIS** para empezar (cluster M0) y no requiere tarjeta de crédito.

### Paso 1: Crear Cuenta en MongoDB Atlas

1. **Ve a:** https://www.mongodb.com/cloud/atlas/register
2. **Completa el registro:**
   - Email
   - Contraseña
   - Nombre y apellido
3. **Acepta los términos** y haz clic en "Create Account"
4. **Verifica tu email** (revisa tu bandeja de entrada)

### Paso 2: Crear tu Primer Cluster

Una vez dentro del dashboard:

1. **Haz clic en "Build a Database"** (botón verde grande)

2. **Selecciona el plan FREE:**
   - Opción: **"M0 Free"**
   - 512 MB de almacenamiento
   - Shared RAM
   - No requiere tarjeta de crédito
   - **Haz clic en "Create"**

3. **Selecciona el proveedor y región:**
   - **Provider:** AWS (recomendado)
   - **Region:** Elige la más cercana a ti:
     - Si estás en Europa: `eu-west-1` (Irlanda) o `eu-central-1` (Frankfurt)
     - Si estás en América: `us-east-1` (N. Virginia) o `us-west-2` (Oregon)
     - Si estás en Asia: `ap-southeast-1` (Singapore)

4. **Cluster Name:**
   - Déjalo como está o cámbialo a: `estoy-bien-cluster`

5. **Haz clic en "Create Cluster"**
   - ⏱️ La creación toma 1-3 minutos

### Paso 3: Configurar Seguridad - Database Access (Usuario)

Mientras se crea el cluster, configuraremos el acceso:

1. **Ve a la pestaña "Database Access"** (en el menú izquierdo, bajo "Security")

2. **Haz clic en "+ ADD NEW DATABASE USER"**

3. **Completa los datos:**
   - **Authentication Method:** Password
   - **Username:** `estoyBienAdmin` (o el que prefieras)
   - **Password:** Haz clic en "Autogenerate Secure Password"
     - **¡GUARDA ESTA CONTRASEÑA!** La necesitarás después
     - O crea una contraseña personalizada (mínimo 8 caracteres)

4. **Database User Privileges:**
   - Selecciona: **"Read and write to any database"**

5. **Haz clic en "Add User"**

### Paso 4: Configurar Network Access (IP Whitelist)

1. **Ve a la pestaña "Network Access"** (en el menú izquierdo, bajo "Security")

2. **Haz clic en "+ ADD IP ADDRESS"**

3. **Elige una opción:**

   **Opción A - Para desarrollo (más fácil):**
   - Haz clic en "ALLOW ACCESS FROM ANYWHERE"
   - Esto agregará `0.0.0.0/0`
   - ⚠️ Menos seguro pero más conveniente para desarrollo

   **Opción B - Para producción (más seguro):**
   - Haz clic en "ADD CURRENT IP ADDRESS"
   - Esto agregará tu IP actual
   - 💡 Deberás agregar cada IP desde la que te conectes

4. **Haz clic en "Confirm"**

### Paso 5: Obtener la Connection String

1. **Ve a "Database"** (en el menú izquierdo)

2. **Tu cluster debería estar listo** (status: Active)

3. **Haz clic en el botón "Connect"** (junto a tu cluster)

4. **Selecciona:** "Connect your application"

5. **Configuración:**
   - **Driver:** Node.js
   - **Version:** 5.5 or later

6. **Copia la Connection String** que aparece:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

7. **Reemplaza los valores:**
   - `<username>` → Tu usuario (ej: `estoyBienAdmin`)
   - `<password>` → Tu contraseña (la que guardaste en el Paso 3)
   - Agrega el nombre de la base de datos después de `.net/`: `estoy-bien`

   **Ejemplo final:**
   ```
   mongodb+srv://estoyBienAdmin:MiPassword123@cluster0.abc123.mongodb.net/estoy-bien?retryWrites=true&w=majority
   ```

### Paso 6: Configurar el Backend

1. **Abre el archivo `.env` en la carpeta `backend/`:**
   ```bash
   cd backend
   nano .env
   ```

2. **Agrega la connection string:**
   ```env
   MONGODB_URI=mongodb+srv://estoyBienAdmin:MiPassword123@cluster0.abc123.mongodb.net/estoy-bien?retryWrites=true&w=majority
   ```

3. **Guarda el archivo** (Ctrl+O, Enter, Ctrl+X en nano)

### Paso 7: Probar la Conexión

```bash
# Asegúrate de estar en la carpeta backend/
cd backend

# Si no has instalado las dependencias:
npm install

# Inicia el servidor
npm run dev
```

**Deberías ver:**
```
✓ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
✓ Server running in development mode on port 5000
✓ Alert check scheduled: every 1 minute(s)
```

---

## 🖥️ Opción 2: MongoDB Local (Para desarrollo sin internet)

### Para Windows:

1. **Descarga MongoDB Community Server:**
   - Ve a: https://www.mongodb.com/try/download/community
   - Selecciona: Windows, MSI Package
   - Descarga e instala

2. **Instala MongoDB Compass** (GUI):
   - Incluido en el instalador o descarga desde:
   - https://www.mongodb.com/try/download/compass

3. **Inicia MongoDB:**
   ```powershell
   # MongoDB se instala como servicio y se inicia automáticamente
   # Para verificar:
   net start MongoDB
   ```

4. **Connection String para local:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/estoy-bien
   ```

### Para macOS:

```bash
# Instalar con Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Iniciar MongoDB
brew services start mongodb-community

# Connection String
MONGODB_URI=mongodb://localhost:27017/estoy-bien
```

### Para Linux (Ubuntu/Debian):

```bash
# Importar la clave pública de MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Crear el archivo de lista
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Actualizar paquetes
sudo apt-get update

# Instalar MongoDB
sudo apt-get install -y mongodb-org

# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verificar estado
sudo systemctl status mongod

# Connection String
MONGODB_URI=mongodb://localhost:27017/estoy-bien
```

---

## 🔍 Verificar la Conexión

### Método 1: MongoDB Compass (GUI)

1. **Abre MongoDB Compass**
2. **Pega tu connection string**
3. **Haz clic en "Connect"**
4. **Deberías ver:**
   - Databases en el panel izquierdo
   - La base de datos `estoy-bien` se creará automáticamente al primer registro

### Método 2: Desde el código

El backend ya incluye verificación de conexión. Al iniciar verás:

✅ **Conexión exitosa:**
```
info: MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
```

❌ **Error de conexión:**
```
error: Error connecting to MongoDB: [mensaje de error]
```

**Errores comunes:**

1. **"Authentication failed"**
   - Verifica usuario y contraseña en la connection string
   - Caracteres especiales en la contraseña deben estar URL-encoded

2. **"Could not connect to any servers"**
   - Verifica que tu IP esté en la whitelist (Network Access)
   - Verifica tu conexión a internet

3. **"Connection timeout"**
   - Verifica la URL del cluster
   - Verifica firewall/antivirus

---

## 📊 Explorar la Base de Datos

### Usando MongoDB Compass:

1. **Conecta a tu base de datos**
2. **Navega a:** `estoy-bien` database
3. **Verás las colecciones:**
   - `users` - Usuarios registrados
   - `contacts` - Contactos de confianza
   - `checkins` - Check-ins diarios
   - `alerts` - Alertas generadas

4. **Para ver documentos:**
   - Haz clic en una colección
   - Verás todos los documentos (registros)

### Usando MongoDB Atlas Web UI:

1. **Ve a "Database"** en el menú
2. **Haz clic en "Browse Collections"**
3. **Selecciona la database:** `estoy-bien`
4. **Explora las colecciones**

---

## 🛠️ Herramientas Útiles

### 1. MongoDB Compass (Recomendado)

**Descarga:** https://www.mongodb.com/products/compass

**Características:**
- Interfaz gráfica intuitiva
- Visualización de documentos
- Consultas visuales
- Análisis de performance
- Importar/Exportar datos

### 2. Studio 3T (Avanzado)

**Descarga:** https://studio3t.com/download/

**Características:**
- SQL queries en MongoDB
- Herramientas de migración
- Comparación de bases de datos
- Más features avanzadas

### 3. Línea de comandos (mongosh)

```bash
# Instalar mongosh
npm install -g mongosh

# Conectar
mongosh "mongodb+srv://usuario:password@cluster.mongodb.net/estoy-bien"

# Comandos útiles
show dbs              # Listar bases de datos
use estoy-bien        # Usar base de datos
show collections      # Listar colecciones
db.users.find()       # Ver todos los usuarios
db.users.countDocuments()  # Contar usuarios
```

---

## 🔐 Seguridad en Producción

### Para MongoDB Atlas:

1. **Nunca uses `0.0.0.0/0` en producción**
   - Agrega solo las IPs específicas de tus servidores

2. **Rota las contraseñas regularmente**
   - Database Access > Editar usuario > Cambiar contraseña

3. **Usa roles específicos**
   - Crea usuarios con permisos limitados para cada aplicación

4. **Habilita backup**
   - Database > Backup tab
   - Configura backups automáticos

5. **Monitorea el acceso**
   - Database Access > Activity Feed
   - Revisa logs regularmente

### Variables de Entorno:

**NUNCA** hagas commit del archivo `.env` con credenciales reales:

```bash
# Verifica que .env está en .gitignore
cat backend/.gitignore | grep .env
```

---

## 📈 Límites del Plan Gratuito (M0)

- ✅ 512 MB de almacenamiento
- ✅ Shared RAM
- ✅ Conexiones ilimitadas
- ✅ Backups manuales
- ❌ No incluye backups automáticos
- ❌ No incluye análisis avanzado

**¿Cuántos usuarios puedo tener?**

Con 512 MB puedes almacenar aproximadamente:
- **5,000-10,000 usuarios** (con check-ins normales)
- **50,000-100,000 check-ins**
- **10,000-20,000 contactos**

**¿Cuándo actualizar?**

Cuando necesites:
- Más almacenamiento (>512 MB)
- Backups automáticos
- Mejor performance
- Réplicas para alta disponibilidad

---

## 🆘 Solución de Problemas

### Error: "Bad auth: Authentication failed"

```env
# Verifica que no haya espacios
MONGODB_URI=mongodb+srv://usuario:password@cluster.net/estoy-bien

# Caracteres especiales en la contraseña deben estar encoded
# Ej: @ se convierte en %40, # en %23
# Usa: https://www.urlencoder.org/
```

### Error: "ECONNREFUSED" (MongoDB local)

```bash
# Verificar si MongoDB está corriendo
# Windows:
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

### Error: "MongooseServerSelectionError"

1. Verifica tu conexión a internet
2. Verifica que tu IP esté en la whitelist
3. Verifica la URL del cluster
4. Intenta conectar desde MongoDB Compass primero

### Ver logs detallados:

```bash
# En el backend, el archivo .env
LOG_LEVEL=debug

# Reinicia el servidor
npm run dev
```

---

## ✅ Checklist de Configuración

- [ ] Cuenta de MongoDB Atlas creada
- [ ] Cluster M0 Free creado
- [ ] Usuario de base de datos creado
- [ ] Contraseña guardada de forma segura
- [ ] IP agregada a Network Access
- [ ] Connection string copiada
- [ ] Connection string agregada a `.env`
- [ ] Variables reemplazadas (usuario, password)
- [ ] Nombre de base de datos agregado (`estoy-bien`)
- [ ] Backend instalado (`npm install`)
- [ ] Backend iniciado (`npm run dev`)
- [ ] Conexión verificada (ver logs)
- [ ] MongoDB Compass instalado (opcional)
- [ ] Conexión desde Compass verificada (opcional)

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:

1. **Revisa los logs del backend:**
   ```bash
   npm run dev
   # Lee cuidadosamente el mensaje de error
   ```

2. **Verifica el connection string:**
   ```bash
   echo $MONGODB_URI
   # O en Windows: echo %MONGODB_URI%
   ```

3. **Prueba la conexión con mongosh:**
   ```bash
   mongosh "tu_connection_string"
   ```

4. **Documentación oficial:**
   - MongoDB Atlas: https://docs.atlas.mongodb.com/
   - MongoDB Node.js Driver: https://docs.mongodb.com/drivers/node/

---

¡Listo! Una vez que veas el mensaje "MongoDB Connected" en los logs, tu base de datos está funcionando correctamente y lista para usar. 🎉
