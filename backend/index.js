const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());


const userRoutes    = require('./src/routes/users.routes');
const productRoutes = require('./src/routes/products.routes');
const orderRoutes   = require('./src/routes/orders.routes');

app.use('/api/users',    userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);


app.get('/', (req, res) => {
  res.json({ message: ' CaféApp API corriendo correctamente' });
});


const errorHandler = require('./src/middlewares/errorHandler');
app.use(errorHandler);


const PORT     = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cafeapp';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(' Conectado a MongoDB');
    app.listen(PORT, () => console.log(` Servidor en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error(' Error al conectar a MongoDB:', err.message);
    process.exit(1);
  });
