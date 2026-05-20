import 'dotenv/config';
import { connectDB } from './src/config/db.js';
import app from './src/app.js';
import { logger } from './src/utils/logger.js';
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "1.0.0.1"]);
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Kết nối CSDL trước
    await connectDB();

    // Khởi động server
    app.listen(PORT, () => {
      logger.info(`Server đang chạy ở chế độ ${process.env.NODE_ENV} trên port ${PORT}`);
    });
  } catch (error) {
    logger.error('Lỗi khi khởi động server:', error.message);
    process.exit(1);
  }
};

startServer();
