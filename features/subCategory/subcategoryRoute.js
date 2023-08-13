const express = require("express");

const router = express.Router(
  { mergeParams: true } // to get the params from the parent router
);
const { protect, allowTo } = require("../auth/authService");

const {
  getSubCategories,
  getSubCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  setCategoryId,
} = require("./subcategoryService");

const {
  getSubCategoryValidator,
  createSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
  getAllSubCategoryValidator,
} = require("./subcategoryValidator");

router
  .route("/")
  .get(getAllSubCategoryValidator, getSubCategories)
  .post(protect, allowTo("admin"),setCategoryId,createSubCategoryValidator, createSubCategory);

router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .put(protect, allowTo("admin"),updateSubCategoryValidator, updateSubCategory)
  .delete(protect, allowTo("admin"),deleteSubCategoryValidator, deleteSubCategory);

module.exports = router;
