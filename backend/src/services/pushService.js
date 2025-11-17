const admin = require('firebase-admin');
const logger = require('../utils/logger');

class PushNotificationService {
  constructor() {
    try {
      // Initialize Firebase Admin SDK
      if (process.env.FIREBASE_PROJECT_ID &&
          process.env.FIREBASE_PRIVATE_KEY &&
          process.env.FIREBASE_CLIENT_EMAIL) {

        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL
          })
        });

        this.messaging = admin.messaging();
        logger.info('Push notification service (Firebase) initialized');
      } else {
        logger.warn('Push notification service not configured. Set FIREBASE_* environment variables.');
        this.messaging = null;
      }
    } catch (error) {
      logger.error('Error initializing Firebase:', error);
      this.messaging = null;
    }
  }

  /**
   * Check if push service is configured
   */
  isConfigured() {
    return this.messaging !== null;
  }

  /**
   * Send alert push notification
   */
  async sendAlertNotification(fcmToken, user, alertLevel, hoursSince) {
    if (!this.isConfigured()) {
      logger.warn('Push notification service not configured, skipping push send');
      return {
        success: false,
        error: 'Push notification service not configured'
      };
    }

    if (!fcmToken) {
      return {
        success: false,
        error: 'No FCM token provided'
      };
    }

    try {
      const notification = this.getAlertNotification(user, alertLevel, hoursSince);

      const message = {
        token: fcmToken,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: {
          type: 'alert',
          level: alertLevel,
          userId: user._id.toString(),
          userName: user.name,
          hoursSince: hoursSince.toString()
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'alerts',
            priority: 'high',
            defaultVibrateTimings: true
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      logger.info(`Alert push notification sent: ${response}`);

      return {
        success: true,
        messageId: response
      };
    } catch (error) {
      logger.error('Error sending alert push notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send check-in confirmation push notification
   */
  async sendCheckInNotification(fcmToken, user) {
    if (!this.isConfigured()) {
      logger.warn('Push notification service not configured, skipping push send');
      return {
        success: false,
        error: 'Push notification service not configured'
      };
    }

    if (!fcmToken) {
      return {
        success: false,
        error: 'No FCM token provided'
      };
    }

    try {
      const message = {
        token: fcmToken,
        notification: {
          title: '✓ Check-in Confirmado',
          body: `Tu check-in del ${new Date().toLocaleTimeString('es-ES')} ha sido registrado.`
        },
        data: {
          type: 'checkin_confirmation',
          userId: user._id.toString(),
          timestamp: new Date().toISOString()
        },
        android: {
          notification: {
            sound: 'default',
            channelId: 'checkins',
            color: '#10B981'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default'
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      logger.info(`Check-in push notification sent: ${response}`);

      return {
        success: true,
        messageId: response
      };
    } catch (error) {
      logger.error('Error sending check-in push notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send reminder push notification
   */
  async sendReminderNotification(fcmToken, user, hoursSinceLastCheckIn) {
    if (!this.isConfigured()) {
      logger.warn('Push notification service not configured, skipping push send');
      return {
        success: false,
        error: 'Push notification service not configured'
      };
    }

    if (!fcmToken) {
      return {
        success: false,
        error: 'No FCM token provided'
      };
    }

    try {
      const message = {
        token: fcmToken,
        notification: {
          title: '⏰ Recordatorio - Estoy Bien',
          body: `Han pasado ${hoursSinceLastCheckIn} horas desde tu último check-in. ¡No olvides reportar que estás bien!`
        },
        data: {
          type: 'reminder',
          userId: user._id.toString(),
          hoursSince: hoursSinceLastCheckIn.toString()
        },
        android: {
          notification: {
            sound: 'default',
            channelId: 'reminders',
            color: '#F59E0B'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default'
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      logger.info(`Reminder push notification sent: ${response}`);

      return {
        success: true,
        messageId: response
      };
    } catch (error) {
      logger.error('Error sending reminder push notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendMulticast(tokens, notification, data = {}) {
    if (!this.isConfigured()) {
      logger.warn('Push notification service not configured, skipping multicast send');
      return {
        success: false,
        error: 'Push notification service not configured'
      };
    }

    if (!tokens || tokens.length === 0) {
      return {
        success: false,
        error: 'No tokens provided'
      };
    }

    try {
      const message = {
        tokens: tokens,
        notification: notification,
        data: data
      };

      const response = await this.messaging.sendMulticast(message);

      logger.info(`Multicast push notification sent. Success: ${response.successCount}, Failed: ${response.failureCount}`);

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      };
    } catch (error) {
      logger.error('Error sending multicast push notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get alert notification content
   */
  getAlertNotification(user, alertLevel, hoursSince) {
    const levelInfo = {
      '24h': {
        emoji: '⚠️',
        title: 'Atención - Alerta 24h',
        priority: 'high'
      },
      '48h': {
        emoji: '🔔',
        title: 'Alerta - 48 horas',
        priority: 'high'
      },
      '72h': {
        emoji: '🚨',
        title: 'ALERTA CRÍTICA - 72 horas',
        priority: 'max'
      }
    };

    const info = levelInfo[alertLevel] || levelInfo['24h'];

    return {
      title: `${info.emoji} ${info.title}`,
      body: `${user.name} no ha hecho check-in en ${hoursSince} horas. Por favor, contáctalo/a.`,
      priority: info.priority
    };
  }

  /**
   * Subscribe token to topic
   */
  async subscribeToTopic(tokens, topic) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Push notification service not configured'
      };
    }

    try {
      const response = await this.messaging.subscribeToTopic(tokens, topic);
      logger.info(`Subscribed to topic ${topic}. Success: ${response.successCount}`);

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      logger.error(`Error subscribing to topic ${topic}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Unsubscribe token from topic
   */
  async unsubscribeFromTopic(tokens, topic) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Push notification service not configured'
      };
    }

    try {
      const response = await this.messaging.unsubscribeFromTopic(tokens, topic);
      logger.info(`Unsubscribed from topic ${topic}. Success: ${response.successCount}`);

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      logger.error(`Error unsubscribing from topic ${topic}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new PushNotificationService();
