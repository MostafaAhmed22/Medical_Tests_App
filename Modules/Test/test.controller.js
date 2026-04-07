import { testModel } from "../../Database/Models/test.model.js";
import { categoryModel } from "../../Database/Models/category.model.js";
import { orderModel } from "../../Database/Models/order.model.js";
import { submissionModel } from "../../Database/Models/submission.model.js";
import { catchAsync } from "../../Utils/Error/catchAsync.js";
import { AppError } from "../../Utils/Error/AppError.js";

// Admin: Create a new test
export const createTest = catchAsync(async (req, res, next) => {
  const { category } = req.body;

  // Verify category exists
  const categoryExists = await categoryModel.findById(category);
  if (!categoryExists) return next(new AppError("Category not found", 404));

  const test = await testModel.create(req.body);

  res.status(201).json({
    status: "success",
    data: test,
  });
});

// Get all tests (with optional category filtering)q1
export const getAllTests = catchAsync(async (req, res, next) => {
  const query = { isPublished: true };
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Basic filtering, sorting, and pagination could be added here
  const tests = await testModel.find(query).populate("category", "name");

  res.status(200).json({
    status: "success",
    results: tests.length,
    data: tests,
  });
});

/**
 * Get single test details
 * Note: Questions are returned here, but in a real app, you might want to 
 * hide them until payment is verified for the specific user.
 */
export const getTest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const test = await testModel.findById(id).populate("category", "name");

  if (!test) return next(new AppError("Test not found", 404));

  res.status(200).json({
    status: "success",
    data: test,
  });
});

// Admin: Update a test
export const updateTest = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (req.body.category) {
    const categoryExists = await categoryModel.findById(req.body.category);
    if (!categoryExists) return next(new AppError("Category not found", 404));
  }

  const updatedTest = await testModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTest) return next(new AppError("Test not found", 404));

  res.status(200).json({
    status: "success",
    data: updatedTest,
  });
});

// Delete a test
export const deleteTest = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedTest = await testModel.findByIdAndDelete(id);

  if (!deletedTest) return next(new AppError("Test not found", 404));

  res.status(200).json({
    status: "success",
    message: "Test deleted successfully",
  });
});

// Get authorized test questions (only for paid users)
export const getAuthorizedTestQuestions = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  // 1. Check if user has paid for this test
  const order = await orderModel.findOne({
    userId,
    isPaid: true,
    status: "Completed",
    "orderItems.testId": id,
  });

  if (!order) {
    return next(
      new AppError("You must purchase this test before taking it", 403),
    );
  }

  // 2. Return questions with options (no points shown to prevent cheating if needed, but here we'll include)
  const test = await testModel.findById(id).select("questions title instructions totalQuestions");
  if (!test) return next(new AppError("Test not found", 404));

  res.status(200).json({
    status: "success",
    data: test,
  });
});

// Submit test answers and get score + interpretation
export const submitTest = catchAsync(async (req, res, next) => {
  const { id } = req.params; // testId
  const { answers } = req.body; // Array of { questionId, selectedOptionIndex }
  const userId = req.user._id;

  // 1. Verify purchase again
  const order = await orderModel.findOne({
    userId,
    isPaid: true,
    status: "Completed",
    "orderItems.testId": id,
  });

  if (!order) {
    return next(new AppError("Unauthorized test submission", 403));
  }

  const test = await testModel.findById(id);
  if (!test) return next(new AppError("Test not found", 404));

  // 2. Calculate score
  let totalScore = 0;
  const processedAnswers = [];

  for (const answer of answers) {
    const question = test.questions.id(answer.questionId);
    if (!question) continue;

    const selectedOption = question.options[answer.selectedOptionIndex];
    if (!selectedOption) continue;

    totalScore += selectedOption.points;
    processedAnswers.push({
      questionId: answer.questionId,
      selectedOptionIndex: answer.selectedOptionIndex,
      pointsEarned: selectedOption.points,
    });
  }

  // 3. Find matching interpretation
  const interpretation = test.interpretations.find(
    (inter) => totalScore >= inter.minScore && totalScore <= inter.maxScore,
  );

  if (!interpretation) {
    return next(
      new AppError("No interpretation found for your score.", 500),
    );
  }

  // 4. Save submission
  const submission = await submissionModel.create({
    userId,
    testId: id,
    answers: processedAnswers,
    totalScore,
    interpretation: {
      label: interpretation.label,
      description: interpretation.description,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      totalScore,
      interpretation: submission.interpretation,
      submissionId: submission._id,
    },
  });
});
