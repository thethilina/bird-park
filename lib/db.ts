import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

const connect = async () => {
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (isConnected || mongoose.connection.readyState === 1) {
    console.log("Already connected");
    return;
  }

  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(MONGODB_URI, {
      dbName: "Bird-Park",
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Mongo connection error:", error);
    throw error;
  }
};

export default connect;
