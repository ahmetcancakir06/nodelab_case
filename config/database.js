
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1); // Uygulama çökmesin diye bağlantı başarısızsa çık
  }
};

module.exports = connectDB;