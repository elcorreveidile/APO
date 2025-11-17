#!/usr/bin/env node
/**
 * Diagnóstico del Sistema Estoy Bien
 *
 * Este script verifica que todo esté configurado correctamente
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  title: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`)
};

let errors = 0;
let warnings = 0;

console.log('\n' + '='.repeat(60));
console.log(colors.bold + colors.cyan + '  🔍 Diagnóstico del Sistema - Estoy Bien' + colors.reset);
console.log('='.repeat(60));

// 1. Verificar Node.js
log.title('1. Versión de Node.js');
const nodeVersion = process.version;
const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
if (nodeMajor >= 18) {
  log.success(`Node.js ${nodeVersion} (✓ Compatible)`);
} else {
  log.error(`Node.js ${nodeVersion} (✗ Se requiere v18 o superior)`);
  errors++;
}

// 2. Verificar archivo .env
log.title('2. Archivo de Configuración (.env)');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  log.success('.env existe');

  // Cargar .env
  require('dotenv').config({ path: envPath });

  // Verificar variables críticas
  const criticalVars = {
    'MONGODB_URI': process.env.MONGODB_URI,
    'JWT_SECRET': process.env.JWT_SECRET,
    'PORT': process.env.PORT
  };

  log.info('Variables críticas:');
  for (const [key, value] of Object.entries(criticalVars)) {
    if (value && value.trim() !== '') {
      if (key === 'MONGODB_URI') {
        const masked = value.replace(/:[^:]*@/, ':****@');
        log.success(`  ${key}: ${masked}`);
      } else if (key === 'JWT_SECRET') {
        log.success(`  ${key}: ${'*'.repeat(20)}`);
      } else {
        log.success(`  ${key}: ${value}`);
      }
    } else {
      log.error(`  ${key}: NO CONFIGURADO`);
      errors++;
    }
  }

  // Verificar variables opcionales
  const optionalVars = {
    'EMAIL_USER': process.env.EMAIL_USER,
    'TWILIO_ACCOUNT_SID': process.env.TWILIO_ACCOUNT_SID,
    'FIREBASE_PROJECT_ID': process.env.FIREBASE_PROJECT_ID
  };

  log.info('Variables opcionales (Email, SMS, Push):');
  for (const [key, value] of Object.entries(optionalVars)) {
    if (value && value.trim() !== '') {
      log.success(`  ${key}: Configurado`);
    } else {
      log.warn(`  ${key}: No configurado (opcional)`);
      warnings++;
    }
  }
} else {
  log.error('.env NO EXISTE - Copia .env.example a .env');
  log.info(`  Ejecuta: cp .env.example .env`);
  errors++;
}

// 3. Verificar dependencias
log.title('3. Dependencias de Node.js');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

if (fs.existsSync(packageJsonPath)) {
  log.success('package.json existe');

  if (fs.existsSync(nodeModulesPath)) {
    log.success('node_modules existe (dependencias instaladas)');

    // Verificar dependencias críticas
    const criticalDeps = ['express', 'mongoose', 'jsonwebtoken', 'bcryptjs', 'dotenv'];
    log.info('Verificando dependencias críticas:');
    for (const dep of criticalDeps) {
      try {
        require.resolve(dep);
        log.success(`  ${dep}`);
      } catch (e) {
        log.error(`  ${dep} - NO INSTALADO`);
        errors++;
      }
    }
  } else {
    log.error('node_modules NO EXISTE - Ejecuta: npm install');
    errors++;
  }
} else {
  log.error('package.json NO EXISTE');
  errors++;
}

// 4. Verificar estructura de archivos
log.title('4. Estructura del Proyecto');
const requiredFiles = [
  'server.js',
  'src/models/User.js',
  'src/models/Contact.js',
  'src/models/CheckIn.js',
  'src/models/Alert.js',
  'src/controllers/authController.js',
  'src/routes/auth.js',
  'src/config/database.js'
];

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    log.success(`${file}`);
  } else {
    log.error(`${file} - NO EXISTE`);
    errors++;
  }
}

// 5. Intentar conectar a MongoDB
log.title('5. Conexión a MongoDB');
if (process.env.MONGODB_URI) {
  log.info('Intentando conectar...');

  const mongoose = require('mongoose');

  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  })
    .then(() => {
      log.success('Conexión exitosa a MongoDB');
      log.success(`Host: ${mongoose.connection.host}`);
      log.success(`Base de datos: ${mongoose.connection.name}`);

      mongoose.connection.close();
      printSummary();
    })
    .catch((err) => {
      log.error(`Error de conexión: ${err.message}`);
      errors++;

      if (err.message.includes('authentication')) {
        log.info('  Verifica usuario y contraseña en MONGODB_URI');
      } else if (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED')) {
        log.info('  Verifica que MongoDB esté corriendo');
        log.info('  O usa MongoDB Atlas: https://www.mongodb.com/cloud/atlas');
      }

      mongoose.connection.close();
      printSummary();
    });
} else {
  log.error('MONGODB_URI no configurado');
  errors++;
  printSummary();
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  log.title('📊 Resumen del Diagnóstico');

  if (errors === 0 && warnings === 0) {
    log.success('¡Todo configurado correctamente! 🎉');
    log.info('\nPuedes iniciar el servidor con:');
    console.log(`  ${colors.green}npm run dev${colors.reset}`);
  } else {
    if (errors > 0) {
      log.error(`${errors} error(es) encontrado(s)`);
    }
    if (warnings > 0) {
      log.warn(`${warnings} advertencia(s)`);
    }

    console.log('\n📋 Pasos para corregir:\n');

    if (!fs.existsSync(envPath)) {
      console.log('1. Crea el archivo .env:');
      console.log(`   ${colors.cyan}cp .env.example .env${colors.reset}`);
    }

    if (!fs.existsSync(nodeModulesPath)) {
      console.log('2. Instala dependencias:');
      console.log(`   ${colors.cyan}npm install${colors.reset}`);
    }

    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('mongodb://localhost')) {
      console.log('3. Configura MongoDB:');
      console.log(`   ${colors.cyan}Edita .env y agrega tu MONGODB_URI${colors.reset}`);
      console.log('   Ver guía: MONGODB-SETUP.md');
    }

    console.log('\n💡 Para ayuda detallada, lee:');
    console.log(`   ${colors.cyan}backend/MONGODB-SETUP.md${colors.reset}`);
    console.log(`   ${colors.cyan}backend/README.md${colors.reset}`);
  }

  console.log('='.repeat(60) + '\n');

  process.exit(errors > 0 ? 1 : 0);
}
