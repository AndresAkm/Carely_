import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const maskUri = (text = '') =>
  text.replace(/mongodb(\+srv)?:\/\/[^@\s"]*@/gi, 'mongodb$1://***:***@');

export const backupDatabase = async () => {
  const outputPath = path.join(__dirname, '..', 'backup');

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const command = `mongodump --uri "${process.env.MONGODB_URI}" --out "${outputPath}" --gzip`;

  try {
    const { stdout } = await execAsync(command);
    console.log(`Respaldo completado con éxito: ${stdout || ''}`);
  } catch (error) {
    console.error(`Error en el respaldo: ${maskUri(error.message)}`);
  }
};
