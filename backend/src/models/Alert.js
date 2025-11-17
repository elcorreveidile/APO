const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: String,
    enum: ['24h', '48h', '72h'],
    required: true
  },
  triggeredAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'resolved'],
    default: 'pending'
  },
  lastCheckInAt: {
    type: Date,
    required: true
  },
  hoursSinceCheckIn: {
    type: Number,
    required: true
  },
  notificationsSent: [{
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    },
    method: {
      type: String,
      enum: ['email', 'sms', 'push']
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    error: {
      type: String,
      default: null
    }
  }],
  resolvedAt: {
    type: Date,
    default: null
  },
  resolvedBy: {
    type: String,
    enum: ['user_checkin', 'manual', 'system', null],
    default: null
  },
  notes: {
    type: String,
    maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
alertSchema.index({ user: 1, status: 1, triggeredAt: -1 });
alertSchema.index({ status: 1, triggeredAt: -1 });

// Method to mark alert as resolved
alertSchema.methods.resolve = async function(resolvedBy = 'system') {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedBy;
  return await this.save();
};

// Static method to get active alerts for a user
alertSchema.statics.getActiveAlerts = async function(userId) {
  return await this.find({
    user: userId,
    status: { $in: ['pending', 'sent'] }
  }).sort({ triggeredAt: -1 });
};

// Static method to get alert statistics
alertSchema.statics.getUserAlertStats = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        triggeredAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    '24h': stats.find(s => s._id === '24h')?.count || 0,
    '48h': stats.find(s => s._id === '48h')?.count || 0,
    '72h': stats.find(s => s._id === '72h')?.count || 0
  };
};

module.exports = mongoose.model('Alert', alertSchema);
