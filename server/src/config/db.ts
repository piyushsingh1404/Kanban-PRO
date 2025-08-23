// server/src/config/db.ts
import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[DB] MONGODB_URI not set; starting API without DB');
    return;
  }

  try {
    console.log('[DB] connecting...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });  // 10s timeout
    console.log('[DB] connected');
  } catch (err) {
    console.error('[DB] Error while connecting:', (err as Error).message);
    // Prevent DB failure from crashing the app (health check won't be affected)
  }
}