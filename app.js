import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import landingRoutes from './routes/landingRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.use('/', landingRoutes);

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Servidor Carely corriendo en http://localhost:${PORT}`);
});
