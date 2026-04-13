import joi from "joi";

// Validation schema for adding a test to the cart
export const addToCartValidation = joi.object({
  testId: joi.string().hex().length(24).required().messages({
    "string.empty": "Test ID is required",
    "string.hex": "Test ID must be a valid hex string",
    "string.length": "Test ID must be 24 characters long",
  }),
  // sessionId: joi.string().optional(), // Disabled for guests
});
