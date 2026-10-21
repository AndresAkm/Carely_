import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ZipArchive } from 'archiver';
import { PassThrough } from 'stream';
import mailer from '../src/config/mailer/mailer.js';
import env from '../src/config/environment/env.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const maskUri = (text = '') =>
  text.replace(/mongodb(\+srv)?:\/\/[^@\s"]*@/gi, 'mongodb$1://***:***@');

const zipDirectory = (sourceDir) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    const archive = new ZipArchive({ zlib: { level: 9 } });
    const stream = new PassThrough();

    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
    archive.on('error', reject);

    archive.pipe(stream);
    archive.directory(sourceDir, false);
    archive.finalize();
  });

const sendBackupByEmail = async (backupPath) => {
  console.log('[backup] Preparando envío del respaldo por correo...');

  if (!mailer.isConfigured()) {
    console.warn('[backup] Envío omitido: SMTP no configurado (MAIL_HOST, MAIL_USER, MAIL_PASS)');
    return false;
  }

  if (!env.mail.backupTo) {
    console.warn('[backup] Envío omitido: MAIL_BACKUP_TO no configurado');
    return false;
  }

  try {
    console.log('[backup] Comprimiendo carpeta backup a ZIP...');
    const zipBuffer = await zipDirectory(backupPath);
    const timestamp = new Date().toISOString().slice(0, 10);
    const sizeMb = (zipBuffer.length / (1024 * 1024)).toFixed(2);
    console.log(`[backup] ZIP generado: ${sizeMb} MB`);

    console.log(`[backup] Enviando correo a ${env.mail.backupTo}...`);
    const info = await mailer.send({
      to: env.mail.backupTo,
      subject: `Respaldo de base de datos Carely - ${timestamp}`,
      text: `Respaldo automático de MongoDB generado el ${timestamp}. Adjunto encontrarás el archivo comprimido con la carpeta backup.`,
      attachments: [
        {
          filename: `carely-backup-${timestamp}.zip`,
          content: zipBuffer,
        },
      ],
    });

    console.log(`[backup] Correo enviado con éxito a ${env.mail.backupTo} (messageId: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`[backup] Error al enviar el respaldo por correo: ${maskUri(error.message)}`);
    return false;
  }
};

export const backupDatabase = async () => {
  const outputPath = path.join(__dirname, '..', 'backup');

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  console.log(`[backup] Iniciando mongodump hacia ${outputPath}...`);
  const command = `mongodump --uri "${process.env.MONGODB_URI}" --out "${outputPath}" --gzip`;

  try {
    const { stdout } = await execAsync(command);
    console.log(`[backup] mongodump completado: ${stdout || 'sin salida'}`);
  } catch (error) {
    console.error(`[backup] Error en mongodump: ${maskUri(error.message)}`);
    return false;
  }

  const sent = await sendBackupByEmail(outputPath);
  return sent;
};
