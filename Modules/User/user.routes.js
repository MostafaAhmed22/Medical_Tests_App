import express from "express";
import { validate } from "../../Middlewares/validate.js";
import {
  userValidation,
  resetPasswordValidation,
  changePasswordValidation,
  updateProfileValidation,
  googleLoginValidation,
} from "../../Validations/userValidation.js";
import { verifyToken } from "../../Middlewares/verifyToken.js";
import {
  register,
  login,
  //googleLogin,
  verifyEmail,
  refresh,
  logout,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  // addToWishlist,
  // removeFromWishlist,
} from "./user.controller.js";


const userRoutes = express.Router();

userRoutes.post("/register", validate(userValidation), register);
userRoutes.post("/login", login);
// userRoutes.post(
//   "/google-login",
//   authLimiter,
//   validate(googleLoginValidation),
//   googleLogin,
// );
userRoutes.post("/logout", verifyToken, logout);
userRoutes.post("/refresh", verifyToken, refresh);
userRoutes.post("/verify-email", verifyToken, verifyEmail);
userRoutes.post("/resend-verification", resendVerification);



userRoutes.post("/forgot-password", forgotPassword);
userRoutes.patch(
  "/reset-password",
  validate(resetPasswordValidation),
  resetPassword,
);

userRoutes.patch(
  "/change-password",
  verifyToken,
  validate(changePasswordValidation),
  changePassword,
);
userRoutes.get("/me", verifyToken, getProfile);
userRoutes.patch(
  "/update-profile",
  verifyToken,
  validate(updateProfileValidation),
  updateProfile,
);
// userRoutes.patch("/wishlist/:productId", verifyToken, addToWishlist);
// userRoutes.delete("/wishlist/:productId", verifyToken, removeFromWishlist);

export default userRoutes;
