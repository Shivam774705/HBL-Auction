import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

if (!global.__mongooseConnection) {
  global.__mongooseConnection = { conn: null, promise: null };
}

const cached = global.__mongooseConnection;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not set");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => {
        console.log("[MongoDB] Connected");
        return m;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
