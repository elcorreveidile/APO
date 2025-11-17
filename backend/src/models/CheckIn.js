const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: null
    },
    address: {
      type: String,
      default: null
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres'],
    default: null
  },
  mood: {
    type: String,
    enum: ['excelente', 'bien', 'regular', 'mal', null],
    default: null
  },
  deviceInfo: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
checkInSchema.index({ 'location.coordinates': '2dsphere' });

// Index for faster queries by user and date
checkInSchema.index({ user: 1, timestamp: -1 });

// Method to get check-in summary
checkInSchema.statics.getUserStats = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        firstCheckIn: { $min: '$timestamp' },
        lastCheckIn: { $max: '$timestamp' }
      }
    }
  ]);

  return stats[0] || { total: 0, firstCheckIn: null, lastCheckIn: null };
};

module.exports = mongoose.model('CheckIn', checkInSchema);
