import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('DB Connection Error:', err.message);
    process.exit(1);
  }
};