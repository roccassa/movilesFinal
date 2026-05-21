const mongoose = require('mongoose');

const connect = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/cafeapp';
  await mongoose.connect(uri);
  console.log('Conectado a MongoDB');
};

module.exports = { connect };
