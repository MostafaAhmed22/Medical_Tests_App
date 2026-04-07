import express from "express";
import {
  createTest,
  getAllTests,
  getTest,
  updateTest,
  deleteTest,
  getAuthorizedTestQuestions,
  submitTest,
} from "./test.controller.js";
import { verifyToken } from "../../Middlewares/verifyToken.js";
import { isAdmin } from "../../Middlewares/isAdmin.js";
import { validate } from "../../Middlewares/validate.js";
import {
  createTestValidation,
  getTestValidation,
  updateTestValidation,
  submitTestValidation,
} from "../../Validations/testValidation.js";

const testRoutes = express.Router();

// Public routes
testRoutes.get("/tests", getAllTests);
testRoutes.get("/tests/:id", validate(getTestValidation), getTest);

// User routes (authenticated)
testRoutes.get(
  "/tests/:id/questions",
  verifyToken,
  validate(getTestValidation),
  getAuthorizedTestQuestions,
);

testRoutes.post(
  "/tests/:id/submit",
  verifyToken,
  validate(submitTestValidation),
  submitTest,
);

// Admin only routes
testRoutes.post(
  "/tests",
  verifyToken,
  isAdmin,
  validate(createTestValidation),
  createTest,
);

testRoutes.put(
  "/tests/:id",
  verifyToken,
  isAdmin,
  validate(updateTestValidation),
  updateTest,
);

testRoutes.delete("/tests/:id", verifyToken, isAdmin, deleteTest);

export default testRoutes;
