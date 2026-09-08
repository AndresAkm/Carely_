import 'dotenv/config';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import va from 'node:util';
import bcrypt from 'bcrypt';
import connectDB from '../config/database/connection.js';
import User from '../modules/users/models/User.js';

const rl = readline.createInterface({ input, output });

const question = (q) => rl.question(q);

const main = async () => {
  await connectDB();

  const firstName = (await question('Nombre: ')).trim();
  const lastName = (await question('Apellidos (opcional): ')).trim();
  const email = (await question('Correo electrónico: ')).trim().toLowerCase();
  const phone = (await question('Teléfono (opcional): ')).trim();
  const password = await new Promise((resolve) => {
    rl.question('Contraseña (mínimo 8 caracteres): ', resolve);
  });

  if (!firstName || !email || !password) {
    console.error('Nombre, correo y contraseña son obligatorios.');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('La contraseña debe tener al menos 8 caracteres.');
    process.exit(1);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.error('Ya existe un usuario con ese correo.');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password: hashedPassword,
    role: 'admin',
    isActive: true,
  });

  console.log(`Administrador creado correctamente: ${user.email}`);
  process.exit(0);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});