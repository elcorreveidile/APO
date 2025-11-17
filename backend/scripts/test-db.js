/**
 * Test Database Connection
 * Script simple para verificar la conexión a MongoDB
 */

require('dotenv').config();
const mongoose = require('mongoose');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m'
};

async function testConnection() {
  console.log('\n' + '='.repeat(60));
  console.log('  🔍 Probando conexión a MongoDB');
  console.log('='.repeat(60) + '\n');

  console.log(`${colors.blue}ℹ${colors.reset} MongoDB URI: ${process.env.MONGODB_URI?.replace(/:[^:]*@/, ':****@') || 'NO CONFIGURADO'}\n`);

  try {
    console.log(`${colors.blue}ℹ${colors.reset} Conectando a MongoDB...`);

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`${colors.green}✓${colors.reset} Conexión exitosa a MongoDB`);
    console.log(`${colors.green}✓${colors.reset} Host: ${mongoose.connection.host}`);
    console.log(`${colors.green}✓${colors.reset} Base de datos: ${mongoose.connection.name}`);
    console.log(`${colors.green}✓${colors.reset} Estado: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);

    // Listar colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n${colors.blue}ℹ${colors.reset} Colecciones encontradas: ${collections.length}`);

    if (collections.length > 0) {
      collections.forEach(col => {
        console.log(`   • ${col.name}`);
      });
    } else {
      console.log(`   ${colors.yellow}⚠${colors.reset} No hay colecciones (base de datos vacía)`);
    }

    // Contar documentos
    if (collections.length > 0) {
      console.log(`\n${colors.blue}ℹ${colors.reset} Documentos por colección:`);
      for (const col of collections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`   • ${col.name}: ${count} documento(s)`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`${colors.green}✓ Base de datos funcionando correctamente${colors.reset}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.log(`\n${colors.red}✗ Error de conexión${colors.reset}`);
    console.log(`${colors.red}✗ Mensaje: ${error.message}${colors.reset}\n`);

    console.log('📋 Checklist de solución de problemas:\n');
    console.log('  1. ¿El archivo .env existe en la carpeta backend/?');
    console.log('  2. ¿La variable MONGODB_URI está configurada?');
    console.log('  3. ¿El usuario y contraseña son correctos?');
    console.log('  4. ¿Tu IP está en la whitelist de MongoDB Atlas?');
    console.log('  5. ¿Tienes conexión a internet?\n');

    console.log(`💡 Usa este comando para verificar la URI:\n`);
    console.log(`   echo $MONGODB_URI\n`);

    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log(`${colors.blue}ℹ${colors.reset} Conexión cerrada\n`);
  }
}

testConnection();
