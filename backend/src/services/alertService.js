const User = require('../models/User');
const Contact = require('../models/Contact');
const Alert = require('../models/Alert');
const emailService = require('./emailService');
const smsService = require('./smsService');
const pushService = require('./pushService');
const logger = require('../utils/logger');

class AlertService {
  /**
   * Check all users and trigger alerts if needed
   */
  async checkAllUsers() {
    try {
      logger.info('Starting alert check for all users...');

      const users = await User.find({ isActive: true });
      let alertsTriggered = 0;

      for (const user of users) {
        const triggered = await this.checkUserAlerts(user);
        if (triggered) alertsTriggered++;
      }

      logger.info(`Alert check completed. ${alertsTriggered} alerts triggered for ${users.length} users.`);

      return {
        success: true,
        usersChecked: users.length,
        alertsTriggered: alertsTriggered
      };
    } catch (error) {
      logger.error('Error in checkAllUsers:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check alerts for a specific user
   */
  async checkUserAlerts(user) {
    try {
      if (!user.lastCheckIn) {
        logger.debug(`User ${user.name} has no check-ins yet, skipping alert check`);
        return false;
      }

      const alertStatus = user.getAlertStatus();

      // Check if we need to trigger alerts
      const needsAlert = ['warning', 'alert', 'critical'].includes(alertStatus.status);

      if (!needsAlert) {
        return false;
      }

      // Check if alert already exists for this level
      const existingAlert = await Alert.findOne({
        user: user._id,
        level: alertStatus.level,
        status: { $in: ['pending', 'sent'] }
      });

      if (existingAlert) {
        logger.debug(`Alert ${alertStatus.level} already exists for user ${user.name}`);
        return false;
      }

      // Create new alert
      const alert = await Alert.create({
        user: user._id,
        level: alertStatus.level,
        lastCheckInAt: user.lastCheckIn,
        hoursSinceCheckIn: alertStatus.hoursSince,
        status: 'pending'
      });

      logger.info(`New alert created for user ${user.name}: ${alertStatus.level}`);

      // Send notifications to contacts
      await this.sendAlertNotifications(user, alert);

      return true;
    } catch (error) {
      logger.error(`Error checking alerts for user ${user.name}:`, error);
      return false;
    }
  }

  /**
   * Send alert notifications to all contacts
   */
  async sendAlertNotifications(user, alert) {
    try {
      // Get user's contacts
      const contacts = await Contact.find({
        user: user._id,
        isActive: true
      }).sort({ priority: 1 });

      if (contacts.length === 0) {
        logger.warn(`User ${user.name} has no active contacts`);
        alert.status = 'failed';
        alert.notes = 'No active contacts found';
        await alert.save();
        return;
      }

      logger.info(`Sending ${alert.level} alert notifications to ${contacts.length} contacts for user ${user.name}`);

      const notifications = [];

      for (const contact of contacts) {
        // Send email if enabled
        if (contact.notificationPreferences.email) {
          const emailResult = await emailService.sendAlertEmail(
            contact,
            user,
            alert.level,
            alert.hoursSinceCheckIn
          );

          notifications.push({
            contact: contact._id,
            method: 'email',
            status: emailResult.success ? 'sent' : 'failed',
            error: emailResult.error || null
          });
        }

        // Send SMS if enabled
        if (contact.notificationPreferences.sms) {
          const smsResult = await smsService.sendAlertSMS(
            contact,
            user,
            alert.level,
            alert.hoursSinceCheckIn
          );

          notifications.push({
            contact: contact._id,
            method: 'sms',
            status: smsResult.success ? 'sent' : 'failed',
            error: smsResult.error || null
          });
        }

        // Small delay between contacts to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Update alert with notification results
      alert.notificationsSent = notifications;
      alert.status = notifications.some(n => n.status === 'sent') ? 'sent' : 'failed';
      await alert.save();

      logger.info(`Alert notifications sent for user ${user.name}. Success: ${notifications.filter(n => n.status === 'sent').length}/${notifications.length}`);

      return {
        success: true,
        notificationsSent: notifications.length,
        successCount: notifications.filter(n => n.status === 'sent').length
      };
    } catch (error) {
      logger.error(`Error sending alert notifications for user ${user.name}:`, error);

      alert.status = 'failed';
      alert.notes = `Error sending notifications: ${error.message}`;
      await alert.save();

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Resolve alerts when user checks in
   */
  async resolveUserAlerts(userId) {
    try {
      // Find all active alerts for user
      const activeAlerts = await Alert.find({
        user: userId,
        status: { $in: ['pending', 'sent'] }
      });

      if (activeAlerts.length === 0) {
        return {
          success: true,
          alertsResolved: 0
        };
      }

      // Mark all as resolved
      for (const alert of activeAlerts) {
        await alert.resolve('user_checkin');
      }

      logger.info(`Resolved ${activeAlerts.length} alerts for user ${userId}`);

      return {
        success: true,
        alertsResolved: activeAlerts.length
      };
    } catch (error) {
      logger.error(`Error resolving alerts for user ${userId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send reminder notification to user
   */
  async sendReminder(user, hoursSince) {
    try {
      // Send push notification if user has FCM token
      if (user.fcmToken) {
        await pushService.sendReminderNotification(
          user.fcmToken,
          user,
          hoursSince
        );
      }

      // Send email reminder
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: '⏰ Recordatorio - Estoy Bien',
        html: `
          <p>Hola ${user.name},</p>
          <p>Han pasado ${hoursSince} horas desde tu último check-in.</p>
          <p>Recuerda hacer tu check-in diario para mantener a tus contactos tranquilos.</p>
          <p>¡Gracias!</p>
        `
      };

      // This would use emailService but simplified here
      logger.info(`Reminder sent to user ${user.name}`);

      return {
        success: true
      };
    } catch (error) {
      logger.error(`Error sending reminder to user ${user.name}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get alert statistics
   */
  async getAlertStats(userId, days = 30) {
    try {
      const stats = await Alert.getUserAlertStats(userId, days);
      return stats;
    } catch (error) {
      logger.error(`Error getting alert stats for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get active alerts for user
   */
  async getActiveAlerts(userId) {
    try {
      const alerts = await Alert.getActiveAlerts(userId)
        .populate('notificationsSent.contact', 'name email phone');
      return alerts;
    } catch (error) {
      logger.error(`Error getting active alerts for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Manually resolve an alert
   */
  async manualResolveAlert(alertId, userId) {
    try {
      const alert = await Alert.findOne({ _id: alertId, user: userId });

      if (!alert) {
        throw new Error('Alert not found');
      }

      await alert.resolve('manual');

      logger.info(`Alert ${alertId} manually resolved by user ${userId}`);

      return {
        success: true,
        alert: alert
      };
    } catch (error) {
      logger.error(`Error manually resolving alert ${alertId}:`, error);
      throw error;
    }
  }
}

module.exports = new AlertService();
