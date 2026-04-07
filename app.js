
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import "dotenv/config";
import userRoutes from './Modules/User/user.routes.js';
import { redisConnection } from './Database/redisConnection.js';

const app = express();

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Routes ──
app.use(userRoutes);

// ── Global Error Handler ──
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── Bootstrap ──
const bootstrap = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }

  try {
    await redisConnection();
  } catch (err) {
    console.error("Redis connection failed:", err.message);
    process.exit(1);
  }

  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
};

bootstrap();