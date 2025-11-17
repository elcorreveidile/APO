const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        logger.error('Email service error:', error);
      } else {
        logger.info('Email service is ready');
      }
    });
  }

  /**
   * Send alert email to contact
   */
  async sendAlertEmail(contact, user, alertLevel, hoursSince) {
    try {
      const subject = this.getAlertSubject(alertLevel, user.name);
      const html = this.getAlertEmailHTML(contact, user, alertLevel, hoursSince);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: contact.email,
        subject: subject,
        html: html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Alert email sent to ${contact.email}: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      logger.error(`Error sending alert email to ${contact.email}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: '¡Bienvenido a Estoy Bien!',
        html: this.getWelcomeEmailHTML(user)
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${user.email}: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      logger.error(`Error sending welcome email to ${user.email}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send check-in confirmation email
   */
  async sendCheckInConfirmation(user) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: '✓ Check-in confirmado',
        html: this.getCheckInConfirmationHTML(user)
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Check-in confirmation sent to ${user.email}: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      logger.error(`Error sending check-in confirmation to ${user.email}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get alert email subject
   */
  getAlertSubject(level, userName) {
    const subjects = {
      '24h': `⚠️ Atención: ${userName} no ha hecho check-in en 24 horas`,
      '48h': `🔔 Alerta: ${userName} no ha hecho check-in en 48 horas`,
      '72h': `🚨 ALERTA CRÍTICA: ${userName} no ha hecho check-in en 72 horas`
    };
    return subjects[level] || `Alerta de Estoy Bien - ${userName}`;
  }

  /**
   * Get alert email HTML
   */
  getAlertEmailHTML(contact, user, alertLevel, hoursSince) {
    const levelInfo = {
      '24h': { color: '#F59E0B', icon: '⚠️', title: 'Atención' },
      '48h': { color: '#F97316', icon: '🔔', title: 'Alerta' },
      '72h': { color: '#EF4444', icon: '🚨', title: 'Alerta Crítica' }
    };

    const info = levelInfo[alertLevel] || levelInfo['24h'];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${info.color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: white; border-left: 4px solid ${info.color}; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: ${info.color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${info.icon} ${info.title}</h1>
            <p style="font-size: 18px; margin: 0;">Estoy Bien - Sistema de Check-in</p>
          </div>
          <div class="content">
            <p>Hola <strong>${contact.name}</strong>,</p>

            <div class="alert-box">
              <h2 style="margin-top: 0; color: ${info.color};">Notificación de Alerta</h2>
              <p><strong>${user.name}</strong> no ha realizado su check-in diario en las últimas <strong>${hoursSince} horas</strong>.</p>

              <p><strong>Información del usuario:</strong></p>
              <ul>
                <li>Nombre: ${user.name}</li>
                <li>Email: ${user.email}</li>
                <li>Teléfono: ${user.phone}</li>
                <li>Último check-in: ${user.lastCheckIn ? new Date(user.lastCheckIn).toLocaleString('es-ES') : 'Nunca'}</li>
              </ul>
            </div>

            <p><strong>¿Qué hacer ahora?</strong></p>
            <ol>
              <li>Intenta contactar a ${user.name} por teléfono o mensaje</li>
              <li>Si no puedes contactarlo/a, considera visitar su domicilio</li>
              <li>En caso de emergencia, contacta a las autoridades locales</li>
            </ol>

            <p style="margin-top: 30px; text-align: center;">
              <a href="tel:${user.phone}" class="button">Llamar a ${user.name}</a>
            </p>

            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              <em>Este es un mensaje automático del sistema Estoy Bien. Has recibido esta alerta porque ${user.name} te ha agregado como contacto de confianza.</em>
            </p>
          </div>
          <div class="footer">
            <p>Estoy Bien - Sistema de Check-in Diario</p>
            <p>Ayudando a personas que viven solas a mantenerse conectadas</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get welcome email HTML
   */
  getWelcomeEmailHTML(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 3px solid #10B981; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ ¡Bienvenido a Estoy Bien!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${user.name}</strong>,</p>

            <p>Nos alegra que te hayas unido a Estoy Bien. Tu cuenta ha sido creada exitosamente.</p>

            <h3>Próximos pasos:</h3>

            <div class="feature">
              <strong>1. Agrega contactos de confianza</strong>
              <p>Configura las personas que recibirán alertas si no haces tu check-in diario.</p>
            </div>

            <div class="feature">
              <strong>2. Realiza tu primer check-in</strong>
              <p>Hazlo diariamente para mantener a tus contactos tranquilos.</p>
            </div>

            <div class="feature">
              <strong>3. Configura tus preferencias</strong>
              <p>Personaliza tu experiencia según tus necesidades.</p>
            </div>

            <p style="margin-top: 30px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>

            <p>¡Gracias por confiar en Estoy Bien!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get check-in confirmation HTML
   */
  getCheckInConfirmationHTML(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Check-in Confirmado</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${user.name}</strong>,</p>
            <p>Tu check-in diario ha sido registrado exitosamente el ${new Date().toLocaleString('es-ES')}.</p>
            <p>Tus contactos de confianza están tranquilos. ¡Gracias por mantenerlos informados!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
