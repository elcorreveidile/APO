const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor ingresa tu nombre'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Por favor ingresa tu email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un email válido'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Por favor ingresa tu teléfono'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Por favor ingresa una contraseña'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir password por defecto en queries
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyInfo: {
    medicalConditions: [String],
    medications: [String],
    allergies: [String],
    bloodType: String
  },
  fcmToken: {
    type: String,
    default: null // Token para notificaciones push de Firebase
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastCheckIn: {
    type: Date,
    default: null
  },
  checkInStreak: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update updatedAt before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user needs alerts
userSchema.methods.needsAlert = function(hours) {
  if (!this.lastCheckIn) return false;

  const timeSinceLastCheckIn = Date.now() - this.lastCheckIn.getTime();
  const hoursInMs = hours * 60 * 60 * 1000;

  return timeSinceLastCheckIn >= hoursInMs;
};

// Method to get user's alert status
userSchema.methods.getAlertStatus = function() {
  if (!this.lastCheckIn) {
    return { status: 'no_checkin', level: null, hoursSince: null };
  }

  const timeSince = Date.now() - this.lastCheckIn.getTime();
  const hoursSince = Math.floor(timeSince / (1000 * 60 * 60));

  if (hoursSince >= 72) {
    return { status: 'critical', level: '72h', hoursSince };
  } else if (hoursSince >= 48) {
    return { status: 'alert', level: '48h', hoursSince };
  } else if (hoursSince >= 24) {
    return { status: 'warning', level: '24h', hoursSince };
  } else {
    return { status: 'ok', level: null, hoursSince };
  }
};

module.exports = mongoose.model('User', userSchema);
