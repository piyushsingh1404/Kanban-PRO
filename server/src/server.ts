import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import boardsRoutes from './routes/boards.routes';

import listRoutes from './routes/lists.routes';
import cardRoutes from './routes/cards.routes';
// ...


const app = express();
app.set('trust proxy', 1);

// Allowed origins (split env CORS_ORIGIN into array)
const allow = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

const corsOptions: cors.CorsOptions = {
  origin(origin, cb) {
    if (!origin || allow.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use('/api/v1/lists', listRoutes);
app.use('/api/v1/cards', cardRoutes);


// health check
app.get('/api/v1/health', (_req, res) => res.json({ ok: true }));

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/boards', boardsRoutes);

// boot
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
