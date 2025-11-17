const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Por favor ingresa el nombre del contacto'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  phone: {
    type: String,
    required: [true, 'Por favor ingresa el teléfono del contacto'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Por favor ingresa el email del contacto'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un email válido'
    ]
  },
  relation: {
    type: String,
    required: [true, 'Por favor especifica la relación'],
    enum: ['Familiar', 'Amigo/a', 'Vecino/a', 'Compañero/a', 'Otro']
  },
  priority: {
    type: Number,
    default: 1, // 1 = Alta, 2 = Media, 3 = Baja
    min: 1,
    max: 3
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
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

// Update updatedAt before saving
contactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
contactSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Contact', contactSchema);
