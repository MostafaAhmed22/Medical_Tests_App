import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
} from "./cart.controller.js";
// import { optionalAuth } from "../../Middlewares/verifyToken.js";
import { verifyToken } from "../../Middlewares/verifyToken.js";
import { validate } from "../../Middlewares/validate.js";
import { addToCartValidation } from "../../Validations/cartValidation.js";

const cartRoutes = express.Router();

// Add test to cart (authenticated users only)
// cartRoutes.post(
//   "/cart",
//   optionalAuth,
//   validate(addToCartValidation),
//   addToCart,
// );
cartRoutes.post("/cart", verifyToken, validate(addToCartValidation), addToCart);

// Get cart details
// cartRoutes.get("/cart", optionalAuth, getCart);
cartRoutes.get("/cart", verifyToken, getCart);

// Remove test from cart
// cartRoutes.delete("/cart/items/:testId", optionalAuth, removeFromCart);
cartRoutes.delete("/cart/items/:testId", verifyToken, removeFromCart);

// Clear entire cart
// cartRoutes.delete("/cart", optionalAuth, clearCart);
cartRoutes.delete("/cart", verifyToken, clearCart);

export default cartRoutes;
