// server/src/config/db.ts
import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[DB] MONGODB_URI not set; starting API without DB');
    return;
  }

  try {
    console.log('[DB] connecting…');
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || undefined,
      serverSelectionTimeoutMS: 5000, // avoid hanging startup
    } as any);
    console.log('[DB] connected');
  } catch (err) {
    console.error('[DB] connection failed:', (err as Error).message);
    // do NOT throw — keep API up so health checks pass
  }
}
