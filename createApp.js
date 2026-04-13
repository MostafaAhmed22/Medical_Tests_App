import express from "express";
import { globalErrorHandler } from "./Middlewares/globalErrorHandler.js";
import userRoutes from "./Modules/User/user.routes.js";
import categoryRoutes from "./Modules/Category/category.routes.js";
import cartRoutes from "./Modules/Cart/cart.routes.js";
import orderRoutes from "./Modules/Order/order.routes.js";
import testRoutes from "./Modules/Test/test.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { AppError } from "./Utils/Error/AppError.js";


import { enforceHttps } from "./Middlewares/enforceHttps.js";
import mongoose from "mongoose";
import { redisClient, redisConnection } from "./Database/redisConnection.js";


/**
 * Creates and configures the Express application.
 * Separated from app.js so supertest can import it without starting a server.
 */
export const createApp = () => {
  const app = express();

  // HTTPS enforcement (production only)
  app.use(enforceHttps);

  // Ensure DB connection before processing requests (Serverless optimization)
  app.use(async (req, res, next) => {
    try {
      // 1. Check MongoDB
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB on the fly");
      }
      
      // 2. Check Redis
      if (!redisClient.isOpen) {
        await redisConnection();
        console.log("Connected to Redis on the fly");
      }
    } catch (err) {
      console.error("On-the-fly connection failed:", err.message);
    }
    next();
  });

  const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4200",
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      credentials: true,
    }),
  );
 
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  app.use(cookieParser());

  app.set("trust proxy", 1);

  // Root route
  app.get("/", (req, res) => {
    res.status(200).json({
      status: "success",
      message: "Express E-Commerce API is running",
    });
  });

  // Ensure all models are registered before routes
  app.use(userRoutes);
  app.use(categoryRoutes);
  app.use(cartRoutes);
  app.use(orderRoutes);
  app.use(testRoutes);

  app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  });
  app.use(globalErrorHandler);

  return app;
};
