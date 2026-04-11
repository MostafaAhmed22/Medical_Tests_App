import Joi from "joi";

/**
 * Validation for category ID parameter
 */
const categoryIdSchema = Joi.string().hex().length(24).required().messages({
  "string.base": "Category ID must be a string",
  "string.empty": "Category ID is required",
  "string.hex": "Category ID must be a valid MongoDB ObjectId",
  "string.length": "Category ID must be exactly 24 characters",
  "any.required": "Category ID is required",
});

export const createCategoryValidation = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.base": "Category name must be a string",
    "string.empty": "Category name is required",
    "string.min": "Category name must be at least 2 characters",
    "string.max": "Category name must not exceed 50 characters",
  }),
});

export const getCategoryValidation = Joi.object({
  id: categoryIdSchema,
});

export const updateCategoryValidation = Joi.object({
  id: categoryIdSchema,
  name: Joi.string().min(2).max(50).messages({
    "string.base": "Category name must be a string",
    "string.empty": "Category name cannot be empty",
    "string.min": "Category name must be at least 2 characters",
    "string.max": "Category name must not exceed 50 characters",
  }),
});

export const deleteCategoryValidation = Joi.object({
  id: categoryIdSchema,
});
