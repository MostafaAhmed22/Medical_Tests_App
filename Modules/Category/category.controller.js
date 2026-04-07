import { categoryModel } from "../../Database/Models/category.model.js";
import { testModel } from "../../Database/Models/test.model.js";
import { catchAsync } from "../../Utils/Error/catchAsync.js";
import { AppError } from "../../Utils/Error/AppError.js";
import slugify from "slugify";

//add category
export const createCategory = catchAsync(async (req, res, next) => {
  const category = await categoryModel.create(req.body);

  res.status(201).json({
    status: "success",
    data: category,
  });
});
//get all categories
export const getCategories = catchAsync(async (req, res, next) => {
  const categories = await categoryModel.find();

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: categories,
  });
});

/**
 * Gets a single category by ID
 */
export const getCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const category = await categoryModel.findById(id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: category,
  });
});

//update category
export const updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (req.body.name) {
    req.body.slug = slugify(req.body.name, { lower: true });
  }

  const updatedCategory = await categoryModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedCategory) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: updatedCategory,
  });
});

//delete category
export const deleteCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Check if there are any tests associated with this category
  const tests = await testModel.find({ category: id });

  if (tests.length > 0) {
    return next(
      new AppError("Cannot delete category with existing tests", 400),
    );
  }

  const deletedCategory = await categoryModel.findByIdAndDelete(id);

  if (!deletedCategory) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Category deleted successfully",
  });
});
