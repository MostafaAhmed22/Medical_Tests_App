import nodemailer from "nodemailer";
import "dotenv/config";
import otpGenerator from "otp-generator";
import { redisClient, redisConnection } from "../../Database/redisConnection.js";

export const sendEmail = async (user, subject, messageType) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
  });

  try {
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    // Ensure Redis is connected before we try to set the key
    if (!redisClient.isOpen) {
      console.log("Redis client was closed, reconnecting in sendEmail...");
      try {
        await redisConnection();
      } catch (err) {
        throw new Error("Could not reconnect to Redis for email: " + err.message);
      }
    }

    const redisKey = `${messageType}:${user.email}`;
    await redisClient.set(redisKey, otp, { EX: 300 });

    const textContent =
      messageType === "verify"
        ? "Use the following OTP to verify your account."
        : "Use the following OTP to reset your password.";

    const mailOptions = {
      from: `"Medical Tests" <${process.env.EMAIL}>`,
      to: user.email,
      subject: subject,
      html: `
      <div style="font-family: Arial, sans-serif; padding:20px;">
          <p>Hi ${user.name || "User"},</p>
          <p>${textContent} It is valid for 5 minutes.</p>
          <h2 style="background: #00466a; width: max-content; padding: 10px; color: #fff; border-radius: 4px;">
            ${otp}
          </h2>
      </div>`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send email to:", user.email, error.message);
    return false;
  }
};
