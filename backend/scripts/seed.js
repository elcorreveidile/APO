/**
 * Seed Script - Datos de Prueba para Estoy Bien
 *
 * Este script crea datos de prueba en la base de datos para desarrollo.
 *
 * Uso:
 *   node scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Contact = require('../src/models/Contact');
const CheckIn = require('../src/models/CheckIn');
const Alert = require('../src/models/Alert');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    log.success('Conectado a MongoDB');
  } catch (error) {
    log.error(`Error conectando a MongoDB: ${error.message}`);
    process.exit(1);
  }
}

async function clearDatabase() {
  log.warn('Limpiando base de datos...');

  await User.deleteMany({});
  await Contact.deleteMany({});
  await CheckIn.deleteMany({});
  await Alert.deleteMany({});

  log.success('Base de datos limpiada');
}

async function createUsers() {
  log.info('Creando usuarios de prueba...');

  const users = [
    {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+34 600 111 111',
      password: 'password123',
      dateOfBirth: new Date('1960-05-15'),
      address: {
        street: 'Calle Mayor 123',
        city: 'Madrid',
        state: 'Madrid',
        zipCode: '28001',
        country: 'España'
      },
      emergencyInfo: {
        medicalConditions: ['Diabetes tipo 2', 'Hipertensión'],
        medications: ['Metformina 850mg', 'Enalapril 10mg'],
        allergies: ['Penicilina'],
        bloodType: 'A+'
      },
      lastCheckIn: new Date(Date.now() - 10 * 60 * 60 * 1000), // Hace 10 horas
      checkInStreak: 15
    },
    {
      name: 'María García',
      email: 'maria@example.com',
      phone: '+34 600 222 222',
      password: 'password123',
      dateOfBirth: new Date('1955-08-20'),
      address: {
        street: 'Avenida del Sol 45',
        city: 'Barcelona',
        state: 'Barcelona',
        zipCode: '08001',
        country: 'España'
      },
      emergencyInfo: {
        medicalConditions: ['Artritis'],
        medications: ['Ibuprofeno 600mg'],
        allergies: [],
        bloodType: 'O+'
      },
      lastCheckIn: new Date(Date.now() - 26 * 60 * 60 * 1000), // Hace 26 horas (trigger alerta 24h)
      checkInStreak: 30
    },
    {
      name: 'Antonio Rodríguez',
      email: 'antonio@example.com',
      phone: '+34 600 333 333',
      password: 'password123',
      dateOfBirth: new Date('1948-12-10'),
      address: {
        street: 'Plaza de España 7',
        city: 'Sevilla',
        state: 'Sevilla',
        zipCode: '41001',
        country: 'España'
      },
      lastCheckIn: new Date(Date.now() - 50 * 60 * 60 * 1000), // Hace 50 horas (trigger alerta 48h)
      checkInStreak: 5
    },
    {
      name: 'Carmen López',
      email: 'carmen@example.com',
      phone: '+34 600 444 444',
      password: 'password123',
      dateOfBirth: new Date('1952-03-25'),
      lastCheckIn: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas (OK)
      checkInStreak: 45
    }
  ];

  const createdUsers = await User.insertMany(users);
  log.success(`${createdUsers.length} usuarios creados`);

  return createdUsers;
}

async function createContacts(users) {
  log.info('Creando contactos de prueba...');

  const contacts = [
    // Contactos para Juan Pérez
    {
      user: users[0]._id,
      name: 'Laura Pérez (Hija)',
      phone: '+34 600 555 111',
      email: 'laura.perez@example.com',
      relation: 'Familiar',
      priority: 1,
      notificationPreferences: {
        email: true,
        sms: true,
        push: true
      }
    },
    {
      user: users[0]._id,
      name: 'Carlos Pérez (Hijo)',
      phone: '+34 600 555 222',
      email: 'carlos.perez@example.com',
      relation: 'Familiar',
      priority: 1,
      notificationPreferences: {
        email: true,
        sms: true,
        push: false
      }
    },
    {
      user: users[0]._id,
      name: 'Ana Martínez (Vecina)',
      phone: '+34 600 555 333',
      email: 'ana.martinez@example.com',
      relation: 'Vecino/a',
      priority: 2,
      notificationPreferences: {
        email: true,
        sms: false,
        push: false
      }
    },

    // Contactos para María García
    {
      user: users[1]._id,
      name: 'Pedro García (Hermano)',
      phone: '+34 600 666 111',
      email: 'pedro.garcia@example.com',
      relation: 'Familiar',
      priority: 1,
      notificationPreferences: {
        email: true,
        sms: true,
        push: true
      }
    },
    {
      user: users[1]._id,
      name: 'Isabel Ruiz (Amiga)',
      phone: '+34 600 666 222',
      email: 'isabel.ruiz@example.com',
      relation: 'Amigo/a',
      priority: 2,
      notificationPreferences: {
        email: true,
        sms: false,
        push: false
      }
    },

    // Contactos para Antonio Rodríguez
    {
      user: users[2]._id,
      name: 'José Rodríguez (Hijo)',
      phone: '+34 600 777 111',
      email: 'jose.rodriguez@example.com',
      relation: 'Familiar',
      priority: 1,
      notificationPreferences: {
        email: true,
        sms: true,
        push: true
      }
    },

    // Contactos para Carmen López
    {
      user: users[3]._id,
      name: 'Roberto López (Sobrino)',
      phone: '+34 600 888 111',
      email: 'roberto.lopez@example.com',
      relation: 'Familiar',
      priority: 1,
      notificationPreferences: {
        email: true,
        sms: true,
        push: false
      }
    },
    {
      user: users[3]._id,
      name: 'Marta Sánchez (Vecina)',
      phone: '+34 600 888 222',
      email: 'marta.sanchez@example.com',
      relation: 'Vecino/a',
      priority: 2,
      notificationPreferences: {
        email: true,
        sms: false,
        push: false
      }
    }
  ];

  const createdContacts = await Contact.insertMany(contacts);
  log.success(`${createdContacts.length} contactos creados`);

  return createdContacts;
}

async function createCheckIns(users) {
  log.info('Creando check-ins de prueba...');

  const checkIns = [];
  const now = new Date();

  // Crear check-ins para los últimos 30 días para cada usuario
  for (const user of users) {
    for (let i = 0; i < 30; i++) {
      // Algunos días sin check-in para simular realismo
      if (Math.random() > 0.1) { // 90% de probabilidad de check-in
        const checkInDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));

        checkIns.push({
          user: user._id,
          timestamp: checkInDate,
          notes: getRandomNote(),
          mood: getRandomMood(),
          location: {
            type: 'Point',
            coordinates: getRandomLocation(),
            address: user.address?.city || 'Madrid, España'
          }
        });
      }
    }
  }

  const createdCheckIns = await CheckIn.insertMany(checkIns);
  log.success(`${createdCheckIns.length} check-ins creados`);

  return createdCheckIns;
}

async function createAlerts(users, contacts) {
  log.info('Creando alertas de prueba...');

  const alerts = [];

  // Crear alerta de 24h para María García (usuario 1)
  if (users[1] && contacts.length > 0) {
    const mariaContacts = contacts.filter(c => c.user.toString() === users[1]._id.toString());

    alerts.push({
      user: users[1]._id,
      level: '24h',
      triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
      status: 'sent',
      lastCheckInAt: users[1].lastCheckIn,
      hoursSinceCheckIn: 26,
      notificationsSent: mariaContacts.map(contact => ({
        contact: contact._id,
        method: 'email',
        status: 'sent',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }))
    });
  }

  // Crear alerta de 48h para Antonio Rodríguez (usuario 2)
  if (users[2] && contacts.length > 0) {
    const antonioContacts = contacts.filter(c => c.user.toString() === users[2]._id.toString());

    alerts.push({
      user: users[2]._id,
      level: '48h',
      triggeredAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // Hace 1 hora
      status: 'sent',
      lastCheckInAt: users[2].lastCheckIn,
      hoursSinceCheckIn: 50,
      notificationsSent: antonioContacts.map(contact => ({
        contact: contact._id,
        method: 'email',
        status: 'sent',
        sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }))
    });
  }

  if (alerts.length > 0) {
    const createdAlerts = await Alert.insertMany(alerts);
    log.success(`${createdAlerts.length} alertas creadas`);
  } else {
    log.warn('No se crearon alertas');
  }
}

// Funciones auxiliares
function getRandomNote() {
  const notes = [
    'Me siento bien hoy',
    'Todo tranquilo',
    'Día normal',
    'Estoy muy bien',
    null, // Algunos sin notas
    'Buen día',
    'Todo en orden'
  ];
  return notes[Math.floor(Math.random() * notes.length)];
}

function getRandomMood() {
  const moods = ['excelente', 'bien', 'bien', 'regular', null];
  return moods[Math.floor(Math.random() * moods.length)];
}

function getRandomLocation() {
  // Coordenadas de diferentes ciudades de España
  const locations = [
    [-3.7038, 40.4168], // Madrid
    [2.1734, 41.3851],  // Barcelona
    [-5.9845, 37.3891], // Sevilla
    [-0.3763, 39.4699], // Valencia
    [-15.4363, 28.1236] // Las Palmas
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

async function seed() {
  console.log('\n' + '='.repeat(50));
  console.log('  🌱 Seed Script - Estoy Bien Database');
  console.log('='.repeat(50) + '\n');

  try {
    // Conectar a la base de datos
    await connectDB();

    // Preguntar si limpiar la base de datos
    console.log('\n⚠️  Este script eliminará TODOS los datos existentes.');
    console.log('¿Estás seguro de que quieres continuar? (y/n)');

    // Para ejecutar sin confirmación, usa: node scripts/seed.js --force
    if (!process.argv.includes('--force')) {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      await new Promise((resolve) => {
        readline.question('', (answer) => {
          readline.close();
          if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
            log.warn('Operación cancelada');
            process.exit(0);
          }
          resolve();
        });
      });
    }

    console.log('');

    // Limpiar base de datos
    await clearDatabase();
    console.log('');

    // Crear datos
    const users = await createUsers();
    const contacts = await createContacts(users);
    const checkIns = await createCheckIns(users);
    await createAlerts(users, contacts);

    console.log('\n' + '='.repeat(50));
    log.success('¡Seed completado exitosamente!');
    console.log('='.repeat(50));

    console.log('\n📊 Resumen de datos creados:');
    console.log(`   • Usuarios: ${users.length}`);
    console.log(`   • Contactos: ${contacts.length}`);
    console.log(`   • Check-ins: ${checkIns.length}`);

    console.log('\n🔑 Credenciales de prueba:');
    console.log('   Email: juan@example.com');
    console.log('   Password: password123\n');
    console.log('   Email: maria@example.com');
    console.log('   Password: password123\n');

    console.log('💡 Puedes usar estas credenciales para hacer login.\n');

  } catch (error) {
    log.error(`Error durante el seed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log.info('Conexión a MongoDB cerrada');
  }
}

// Ejecutar seed
seed();
