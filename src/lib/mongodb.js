import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/superkingsden';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, downUntil: 0 };
}

// How long to stop re-attempting a failed connection before trying again.
// This makes requests fail fast to static fallbacks instead of each one
// blocking for the full serverSelectionTimeoutMS window when the DB is down.
const DB_DOWN_BACKOFF_MS = 10000;

export async function connectToDatabase() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Fast-fail: if a recent connection attempt failed, don't block callers
  // again until the backoff window has elapsed.
  if (cached.downUntil && Date.now() < cached.downUntil) {
    throw new Error('MongoDB temporarily unavailable (fail-fast backoff active)');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Fail fast on an unreachable/slow cluster instead of hanging ~5s per call.
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 20000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 0,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      cached.downUntil = 0;
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.downUntil = Date.now() + DB_DOWN_BACKOFF_MS;
    throw e;
  }

  return cached.conn;
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

export default connectToDatabase;
