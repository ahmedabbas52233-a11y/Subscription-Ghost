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
};
