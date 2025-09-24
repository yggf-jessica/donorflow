import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Missing MONGODB_URI in env");
}

// Avoid multiple connections in dev (Next hot reload)
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "donate_app",
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}