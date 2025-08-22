import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[DB] MONGODB_URI missing in server/.env');
    process.exit(1);
  }

  console.log('[DB] connecting to Mongo…');
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 12000,
      family: 4, // prefer IPv4 to dodge flaky IPv6/DNS
    } as any);
    console.log('[DB] connected');
  } catch (err) {
    console.error('[DB] connection error:', err as any);
    process.exit(1);
  }
}
