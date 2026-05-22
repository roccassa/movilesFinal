// Forzar DNS de Google para resolver registros SRV de MongoDB Atlas
// (algunos ISPs bloquean consultas SRV en su DNS por defecto)
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const { connect }       = require('./src/config/db');
const categoriesService = require('./src/services/categories.service');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users',      require('./src/routes/users.routes'));
app.use('/api/products',   require('./src/routes/products.routes'));
app.use('/api/orders',     require('./src/routes/orders.routes'));
app.use('/api/categories', require('./src/routes/categories.routes'));

app.get('/', (req, res) => res.json({ message: 'CaféApp API corriendo correctamente' }));

app.use(require('./src/middlewares/errorHandler'));

const PORT = process.env.PORT || 3000;

connect()
  .then(async () => {
    await categoriesService.seed();
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err.message);
    process.exit(1);
  });
