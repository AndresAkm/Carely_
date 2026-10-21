import nodemailer from 'nodemailer';
import env from '../environment/env.js';

const { mail } = env;

const isConfigured = () => Boolean(mail.host && mail.user && mail.pass);

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!isConfigured()) return null;

  transporter = nodemailer.createTransport({
    host: mail.host,
    port: mail.port,
    secure: mail.secure,
    auth: {
      user: mail.user,
      pass: mail.pass,
    },
  });

  return transporter;
};

const mailer = {
  isConfigured,
  async send({ to, subject, text, html, attachments }) {
    const transport = getTransporter();
    if (!transport) {
      throw new Error('Correo SMTP no configurado (MAIL_HOST, MAIL_USER, MAIL_PASS)');
    }

    return transport.sendMail({
      from: `"Carely" <${mail.user}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });
  },
};

export default mailer;
