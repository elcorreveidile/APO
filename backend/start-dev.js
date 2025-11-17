/**
 * Script de desarrollo que inicia MongoDB en memoria
 * y luego inicia el servidor Express
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');

let mongod;

async function startDevelopmentServer() {
  try {
    console.log('🔄 Iniciando MongoDB en memoria...');

    // Crear instancia de MongoDB en memoria
    mongod = await MongoMemoryServer.create({
      binary: {
        version: '6.0.0', // Usar versión específica disponible
      },
      instance: {
        dbName: 'estoy-bien',
        port: 27017, // Puerto por defecto
      },
    });

    const uri = mongod.getUri();
    console.log('✅ MongoDB en memoria iniciado');
    console.log('📍 URI:', uri);
    console.log('');

    // Actualizar variable de entorno
    process.env.MONGODB_URI = uri;

    // Iniciar servidor Express
    console.log('🚀 Iniciando servidor Express...');
    console.log('');

    // Requerir el servidor
    require('./server.js');

  } catch (error) {
    console.error('❌ Error al iniciar:', error);
    process.exit(1);
  }
}

// Manejar cierre limpio
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Cerrando servidor...');
  if (mongod) {
    await mongod.stop();
    console.log('✅ MongoDB en memoria detenido');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (mongod) {
    await mongod.stop();
  }
  process.exit(0);
});

// Iniciar
startDevelopmentServer();
