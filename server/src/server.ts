import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cors from 'cors';  // Correct import of CORS

// Import routes
import authRoutes from './routes/auth.routes';
import boardsRoutes from './routes/boards.routes';
import listsRoutes from './routes/lists.routes';
import cardsRoutes from './routes/cards.routes';

// Initialize express app
const app = express();
app.set('trust proxy', 1);

// Health check route (Render will check this route)
app.get('/', (_req, res) => {
  console.log('[Health Check] Responding...');
  res.status(200).json({ ok: true });
});

// CORS setup
const RAW = process.env.CORS_ORIGIN ?? '';
const allow: string[] = RAW.split(',').map(s => s.trim()).filter(Boolean);

// Always include local dev origins (avoid dupes)
for (const o of ['http://localhost:5173', 'http://localhost:5174']) {
  if (!allow.includes(o)) allow.push(o);
}

type OriginCb = (err: Error | null, allow?: boolean) => void;

type MyCorsOptions = {
  origin?: boolean | string | RegExp | (string | RegExp)[] | ((origin: string | undefined, cb: OriginCb) => void);
  methods?: string | string[];
  allowedHeaders?: string | string[];
  credentials?: boolean;
  optionsSuccessStatus?: number;
};

const debug = process.env.CORS_DEBUG === '1';

// supports entries like "*.netlify.app"
function matchesOrigin(origin: string): boolean {
  if (allow.includes(origin)) return true;
  for (const rule of allow) {
    if (rule.startsWith('*.') || origin.endsWith(rule)) {
      const suffix = rule.slice(1); // ".netlify.app"
      if (origin.endsWith(suffix)) return true;
    }
  }
  return false;
}

const corsOptions: MyCorsOptions = {
  origin(origin: string | undefined, cb: OriginCb) {
    if (!origin) {
      if (debug) console.log('[CORS] <no origin> -> ALLOW');
      return cb(null, true); // curl/native apps
    }
    const ok = matchesOrigin(origin);
    if (debug) console.log(`[CORS] ${origin} -> ${ok ? 'ALLOW' : 'BLOCK'}`);
    return cb(null, ok);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  optionsSuccessStatus: 204,
};

app.use(cors.default(corsOptions)); // Apply CORS middleware
app.options('*', cors.default(corsOptions)); // Preflight handling

// ----- Parsers & logs -----
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ----- Routes -----
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/boards', boardsRoutes);
app.use('/api/v1/lists', listsRoutes);
app.use('/api/v1/cards', cardsRoutes);

// ----- 404 -----
app.use((_req: Request, res: Response) => res.status(404).json({ message: 'Not found' }));

// ----- Error handler (no stack in prod) -----
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = Number(err?.status || err?.statusCode) || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err?.message || 'Internal Server Error';
  console.error('[ERROR]', message);  // Log the error message
  res.status(status).json({ message });
});

// ----- Boot -----
const port = Number(process.env.PORT) || 8080;  // Ensure the port is a number
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`[BOOT] API on :${port}`);
});

// Handle port conflict (EADDRINUSE)
server.on('error', (err: any) => {
  if (err?.code === 'EADDRINUSE') {
    console.error(`[BOOT] Port ${port} in use. Set PORT or stop the other process.`);
    process.exit(1);
  }
  console.error('[BOOT] server error:', err);
  process.exit(1);
});

// ----- Connect to DB (background) -----
const connectDB = async () => {
  try {
    console.log('[DB] connecting...');
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('[DB] MONGODB_URI not set');
      return;
    }

    // Use mongoose connection with timeouts to avoid blocking the server startup
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });  // 5 seconds timeout
    console.log('[DB] connected');
  } catch (error) {
    console.error('[DB] MongoDB connection failed:', error);
  }
};

// DB connection (in background to prevent blocking the server)
connectDB().catch((e) => console.error('[DB] unexpected error:', e));

export default app;
