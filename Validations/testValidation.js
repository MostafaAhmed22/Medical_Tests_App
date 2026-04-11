import Joi from "joi";

// Common validation for MongoDB ObjectIDs
const objectIdSchema = Joi.string().hex().length(24);

export const createTestValidation = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).required(),
  category: objectIdSchema.required().messages({
    "any.required": "Category ID is required",
    "string.hex": "Category ID must be a valid MongoDB ObjectId",
  }),
  price: Joi.number().min(0).required(),
  duration: Joi.number().min(1).required(),
  coverImage: Joi.string().uri().optional().allow(null, ""),
  totalQuestions: Joi.number().integer().min(1).required(),
  maxScore: Joi.number().integer().min(1).required(),
  questions: Joi.array().items(
    Joi.object({
      questionText: Joi.string().required(),
      options: Joi.array().items(
        Joi.object({
          text: Joi.string().required(),
          points: Joi.number().integer().min(0).required(),
        }),
      ).min(2).required(),
    }),
  ).min(1).required(),
  interpretations: Joi.array().items(
    Joi.object({
      label: Joi.string().required(),
      minScore: Joi.number().integer().min(0).required(),
      maxScore: Joi.number().integer().required(),
      description: Joi.string().required(),
    }),
  ).min(1).required(),
  isPublished: Joi.boolean().optional(),
});

export const updateTestValidation = Joi.object({
  id: objectIdSchema.required(),
  title: Joi.string().min(2).max(100),
  description: Joi.string().min(10),
  category: objectIdSchema,
  price: Joi.number().min(0),
  duration: Joi.number().min(1),
  coverImage: Joi.string().uri().optional().allow(null, ""),
  totalQuestions: Joi.number().integer().min(1),
  maxScore: Joi.number().integer().min(1),
  questions: Joi.array().items(
    Joi.object({
      questionText: Joi.string(),
      options: Joi.array().items(
        Joi.object({
          text: Joi.string(),
          points: Joi.number().integer().min(0),
        }),
      ),
    }),
  ),
  interpretations: Joi.array().items(
    Joi.object({
      label: Joi.string(),
      minScore: Joi.number().integer().min(0),
      maxScore: Joi.number().integer(),
      description: Joi.string(),
    }),
  ),
  isPublished: Joi.boolean(),
});

export const getTestValidation = Joi.object({
  id: objectIdSchema.required(),
});

export const submitTestValidation = Joi.object({
  id: objectIdSchema.required(),
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: objectIdSchema.required(),
        selectedOptionIndex: Joi.number().integer().min(0).required(),
      }),
    )
    .min(1)
    .required(),
});
