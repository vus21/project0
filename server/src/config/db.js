import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB đã kết nối thành công: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Lỗi kết nối MongoDB: ${error.message}`);
    process.exit(1);
  }
};
