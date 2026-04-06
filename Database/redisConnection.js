
import { createClient } from "redis";
import "dotenv/config";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.error({ err }, "Redis client error"));

export const redisConnection = async () => {
  if (redisClient.isOpen) {
    console.log("Redis client is already open");
    return;
  }
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (err) {
    // Check if the error is just "Socket already opened" which can happen in race conditions
    if (err.message === "Socket already opened") {
      return;
    }
    console.error({ err }, "Redis connection failed");
    throw err;
  }
};
