const mongoose = require('mongoose');

const connect = async () => {
  const uri    = process.env.MONGO_URI || 'mongodb://localhost:27017/cafeapp';
  const dbName = process.env.DB_NAME   || 'cafeapp';

  await mongoose.connect(uri, { dbName });

  console.log(`✅ Conectado a MongoDB · base de datos: "${dbName}"`);
};

module.exports = { connect };
