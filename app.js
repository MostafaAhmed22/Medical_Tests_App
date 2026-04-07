import mongoose from 'mongoose';
import "dotenv/config";
import { redisConnection } from './Database/redisConnection.js';
import { createApp } from "./createApp.js";
import { initLimiters } from "./Middlewares/rateLimiter.js";

const app = createApp();

/**
 * Bootstrap connections and start the server.
 */
const bootstrap = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // 2. Connect to Redis
    await redisConnection();
    console.log("Connected to Redis");

    // 3. Initialize rate limiters
    initLimiters();
    console.log("Rate limiters initialized");

    // 4. Start listening (local only)
    if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Server is running locally on port ${PORT}`);
      });
    }
  } catch (err) {
    console.error("Bootstrap failed:", err.message);
  }
};

bootstrap();

export default app;