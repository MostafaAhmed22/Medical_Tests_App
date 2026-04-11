import joi from "joi";

export const orderValidation = joi.object({
  cartId: joi.string().hex().length(24).required().messages({
    "string.empty": "Cart ID can't be empty",
    "string.hex": "Cart ID must be a valid ObjectId",
    "string.length": "Cart ID must be 24 characters",
    "any.required": "Cart ID is required",
  }),
  status: joi
    .string()
    .valid("Pending", "Completed", "Cancelled")
    .insensitive()
    .messages({
      "any.only":
        "Status must be one of (Pending, Completed, Cancelled)",
    }),
});
