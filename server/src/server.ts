import 'dotenv/config';
import express from 'express';
import cors, { type CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import boardsRoutes from './routes/boards.routes';
import listRoutes from './routes/lists.routes';
import cardRoutes from './routes/cards.routes';

const app = express();
app.set('trust proxy', 1);

// CORS
const allow: string[] = (process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin(origin: string | undefined, callback) {
    if (!origin) return callback(null, true);
    if (allow.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Health
app.get('/api/v1/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/boards', boardsRoutes);
app.use('/api/v1/lists', listRoutes);
app.use('/api/v1/cards', cardRoutes);

// 404
app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

// Boot
(async () => {
  try {
    console.log('[BOOT] starting…');
    await connectDB();
    const port = Number(process.env.PORT) || 8080;
    app.listen(port, () => console.log(`[BOOT] API on :${port}`));
  } catch (e) {
    console.error('[BOOT] fatal:', e);
    process.exit(1);
  }
})();

export default app;
