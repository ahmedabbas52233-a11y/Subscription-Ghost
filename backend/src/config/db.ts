<<<<<<< HEAD
import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45_000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect…');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`❌ MongoDB connection failed: ${msg}`);
    process.exit(1);
  }
=======
import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");

  mongoose.connection.on("disconnected", () =>
    console.warn("⚠️  MongoDB disconnected — retrying…")
  );
  mongoose.connection.on("reconnected", () =>
    console.log("✅ MongoDB reconnected")
  );

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 6_000,
    socketTimeoutMS:          45_000,
  });
  console.log(`✅ MongoDB → ${mongoose.connection.host}`);
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
};
