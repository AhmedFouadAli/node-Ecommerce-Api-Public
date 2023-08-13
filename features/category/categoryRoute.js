const express = require("express");

const router = express.Router();

const subCategoriesRoute = require("../subCategory/subcategoryRoute");

router.use("/:categoryId/subCategories", subCategoriesRoute);

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImage,
} = require("./categoryService");

const { protect, allowTo } = require("../auth/authService");
// protect,
//     allowTo("admin"),

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("./categoryValidator");

router
  .route("/")
  .get(getCategories)

  .post(
    protect,
    allowTo("admin"),
    uploadCategoryImage,
    resizeImage,

    createCategoryValidator,
    createCategory
  );

router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    protect,
    allowTo("admin"),
    uploadCategoryImage,
    resizeImage,
    updateCategoryValidator,
    updateCategory
  )
  .delete(protect, allowTo("admin"), deleteCategoryValidator, deleteCategory);

module.exports = router;
