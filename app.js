import cron from 'node-cron';
import { backupDatabase } from './services/backup.js';
import './src/server.js';

cron.schedule(
  '0 0 0 * * 0',
  async () => {
    console.log('Realizando Backup de la Base de datos (todos los domingos)');
    await backupDatabase();
  },
  {
    timezone: 'America/Bogota',
  }
);
