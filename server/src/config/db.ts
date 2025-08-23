// server/src/config/db.ts
import mongoose from 'mongoose';

// server/src/config/db.ts
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
      serverSelectionTimeoutMS: 10000, // Increased timeout
    } as any);
    console.log('[DB] connected');
  } catch (err) {
    console.error('[DB] connection failed:', (err as Error).message);
    // Don't throw: keep API alive for health checks
  }
}

