import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart
} from "./cart.controller.js";
import { optionalAuth } from "../../Middlewares/verifyToken.js";
import { validate } from "../../Middlewares/validate.js";
import {
  addToCartValidation
} from "../../Validations/cartValidation.js";

const cartRoutes = express.Router();

// Add test to cart (guest or authenticated)
cartRoutes.post(
  "/cart",
  optionalAuth,
  validate(addToCartValidation),
  addToCart,
);

// Get cart details
cartRoutes.get("/cart", optionalAuth, getCart);

// Remove test from cart
cartRoutes.delete("/cart/items/:testId", optionalAuth, removeFromCart);

// Clear entire cart
cartRoutes.delete("/cart", optionalAuth, clearCart);

export default cartRoutes;

