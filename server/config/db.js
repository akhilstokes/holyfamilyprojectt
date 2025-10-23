const mongoose = require('mongoose');

// Optional: align with MongoDB driver's recommended default
mongoose.set('strictQuery', true);

const DEFAULT_OPTS = {
  // Give more time for SRV/DNS resolution and initial selection
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  // Pooling
  maxPoolSize: 10,
  minPoolSize: 0,
  // Retry writes for transient network errors (Atlas friendly)
  retryWrites: true,
};

let isConnecting = false;

const connectDB = async (retries = 5, delayMs = 2000) => {
  if (isConnecting) return;
  isConnecting = true;
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set. Please configure your environment.');
    process.exit(1);
  }

  // helpful connection state logs
  mongoose.connection.on('connected', () => {
    console.log(`MongoDB connected to ${mongoose.connection.host}`);
  });
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err?.message || err);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, DEFAULT_OPTS);
      isConnecting = false;
      return;
    } catch (error) {
      const isLast = attempt === retries;
      console.error(`Mongo connect attempt ${attempt} failed: ${error?.message || error}`);
      if (isLast) {
        console.error('exiting after maximum retries.');
        process.exit(1);
      }
      const backoff = delayMs * Math.pow(2, attempt - 1);
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
  isConnecting = false;
};

module.exports = connectDB;