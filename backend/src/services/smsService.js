const twilio = require('twilio');
const logger = require('../utils/logger');

class SMSService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (this.accountSid && this.authToken) {
      this.client = twilio(this.accountSid, this.authToken);
      logger.info('SMS service (Twilio) initialized');
    } else {
      logger.warn('SMS service not configured. Set TWILIO_* environment variables.');
      this.client = null;
    }
  }

  /**
   * Check if SMS service is configured
   */
  isConfigured() {
    return this.client !== null;
  }

  /**
   * Send alert SMS to contact
   */
  async sendAlertSMS(contact, user, alertLevel, hoursSince) {
    if (!this.isConfigured()) {
      logger.warn('SMS service not configured, skipping SMS send');
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    try {
      const message = this.getAlertMessage(user, alertLevel, hoursSince);

      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: contact.phone
      });

      logger.info(`Alert SMS sent to ${contact.phone}: ${result.sid}`);

      return {
        success: true,
        messageId: result.sid,
        status: result.status
      };
    } catch (error) {
      logger.error(`Error sending alert SMS to ${contact.phone}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send check-in confirmation SMS
   */
  async sendCheckInConfirmation(user) {
    if (!this.isConfigured()) {
      logger.warn('SMS service not configured, skipping SMS send');
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    try {
      const message = `✓ Estoy Bien: Tu check-in del ${new Date().toLocaleString('es-ES')} ha sido registrado. Tus contactos están tranquilos.`;

      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: user.phone
      });

      logger.info(`Check-in confirmation SMS sent to ${user.phone}: ${result.sid}`);

      return {
        success: true,
        messageId: result.sid,
        status: result.status
      };
    } catch (error) {
      logger.error(`Error sending check-in confirmation SMS to ${user.phone}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send verification SMS
   */
  async sendVerificationCode(phone, code) {
    if (!this.isConfigured()) {
      logger.warn('SMS service not configured, skipping SMS send');
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    try {
      const message = `Tu código de verificación de Estoy Bien es: ${code}. Válido por 10 minutos.`;

      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: phone
      });

      logger.info(`Verification SMS sent to ${phone}: ${result.sid}`);

      return {
        success: true,
        messageId: result.sid,
        status: result.status
      };
    } catch (error) {
      logger.error(`Error sending verification SMS to ${phone}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get alert message text
   */
  getAlertMessage(user, alertLevel, hoursSince) {
    const levelEmoji = {
      '24h': '⚠️',
      '48h': '🔔',
      '72h': '🚨'
    };

    const emoji = levelEmoji[alertLevel] || '⚠️';

    return `${emoji} ALERTA ESTOY BIEN: ${user.name} no ha hecho check-in en ${hoursSince} horas. Último check-in: ${user.lastCheckIn ? new Date(user.lastCheckIn).toLocaleString('es-ES') : 'Nunca'}. Por favor, contáctalo/a al ${user.phone}. En caso de emergencia, llama al 911.`;
  }

  /**
   * Send SMS to multiple recipients
   */
  async sendBulkSMS(recipients, message) {
    if (!this.isConfigured()) {
      logger.warn('SMS service not configured, skipping bulk SMS send');
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    const results = [];

    for (const recipient of recipients) {
      try {
        const result = await this.client.messages.create({
          body: message,
          from: this.phoneNumber,
          to: recipient.phone
        });

        results.push({
          recipient: recipient.phone,
          success: true,
          messageId: result.sid
        });

        logger.info(`Bulk SMS sent to ${recipient.phone}: ${result.sid}`);
      } catch (error) {
        results.push({
          recipient: recipient.phone,
          success: false,
          error: error.message
        });

        logger.error(`Error sending bulk SMS to ${recipient.phone}:`, error);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      success: true,
      results: results,
      total: recipients.length,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  }
}

module.exports = new SMSService();
