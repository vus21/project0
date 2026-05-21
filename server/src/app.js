import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import rootRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';

const app = express();

// Cấu hình Rate Limiting (100 req/15min)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10000, // giới hạn 100 request cho mỗi IP
  message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút.',
});

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev')); // Log requests ra console
app.use(limiter);

// Routes
app.use('/api', rootRouter);

// Bắt lỗi 404 (Không tìm thấy route)
app.use(notFound);

// Xử lý lỗi tập trung
app.use(errorHandler);

export default app;
