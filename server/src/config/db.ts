// server/src/config/db.ts
import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI as string;
  if (!uri) throw new Error("MONGODB_URI missing");
  console.log("[DB] connecting to Mongo…");
  await mongoose.connect(uri);
  console.log("[DB] connected");
}
