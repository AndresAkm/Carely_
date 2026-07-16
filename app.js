require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const landingRoutes = require('./routes/landingRoutes');

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
