import mongoose from 'mongoose';

// We cache the connection so it doesn't reconnect on every request
// This is important in Next.js because API routes can run many times
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  // If already connected, return the existing connection
  if (cached.conn) return cached.conn;

  // If a connection is being established, wait for it
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI).then((mongoose) => {
      console.log('MongoDB connected');
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

