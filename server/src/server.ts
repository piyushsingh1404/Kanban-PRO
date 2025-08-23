import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// Use require so cors is callable regardless of tsconfig interop flags
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors') as (opts?: any) => import('express').RequestHandler;

import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import boardsRoutes from './routes/boards.routes';
import listsRoutes from './routes/lists.routes';
import cardsRoutes from './routes/cards.routes';

const app = express();
app.set('trust proxy', 1);

// ----- CORS (allow Netlify / local) -----
// ----- CORS (allow Netlify / local) -----
const RAW = process.env.CORS_ORIGIN ?? '';
const allow: string[] = RAW.split(',').map(s => s.trim()).filter(Boolean);

// ensure locals are allowed (avoid dupes)
for (const o of ['http://localhost:5173', 'http://localhost:5174']) {
  if (!allow.includes(o)) allow.push(o);
}

type OriginCb = (err: Error | null, allow?: boolean) => void;

// local type (avoids @types/cors import hassles)
type MyCorsOptions = {
  origin?: boolean | string | RegExp | (string | RegExp)[]
    | ((origin: string | undefined, cb: OriginCb) => void);
  methods?: string | string[];
  allowedHeaders?: string | string[];
  credentials?: boolean;
  optionsSuccessStatus?: number;
};

const debug = process.env.CORS_DEBUG === '1';

// supports rules like "*.netlify.app"
function matchesOrigin(origin: string): boolean {
  if (allow.includes(origin)) return true;
  for (const rule of allow) {
    if (rule.startsWith('*.') && origin.endsWith(rule.slice(1))) return true;
  }
  return false;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors') as (opts?: any) => import('express').RequestHandler;

const corsOptions: MyCorsOptions = {
  origin(origin: string | undefined, cb: OriginCb) {
    if (!origin) return cb(null, true); // curl/native apps
    const ok = matchesOrigin(origin);
    if (debug) console.log(`[CORS] ${origin} -> ${ok ? 'ALLOW' : 'BLOCK'}`);
    // IMPORTANT: do NOT throw. Return false to omit CORS headers.
    return cb(null, ok);
  },
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Cache-Control'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight


// ----- Parsers & logs -----
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ----- Health -----
app.get('/api/v1/health', (_req: Request, res: Response) => res.json({ ok: true }));

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
      : (err?.message as string) || 'Internal Server Error';
  res.status(status).json({ message });
});

// ----- Boot -----
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
