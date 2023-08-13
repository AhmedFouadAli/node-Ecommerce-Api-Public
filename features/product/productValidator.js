const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const categoryModel = require("../category/categoryModel");
const subCategoryModel = require("../subCategory/subCategoryModel");

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid mongo id"),
  validatorMiddleware,
];

exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title is too short")
    .isLength({ max: 100 })
    .withMessage("Title is too long"),

  check("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 20 })
    .withMessage("Description is too short")
    .isLength({ max: 200 })
    .withMessage("Description is too large"),

  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isNumeric()
    .withMessage("Quantity must be a number"),
  check("sold").optional().isNumeric().withMessage("sold must be a number"),

  check("priceAfterDiscount")
    .notEmpty()
    .withMessage("priceAfterDiscount is required")
    .isNumeric()
    .withMessage("priceAfterDiscount must be a number")
    .toFloat()
    .isLength({ max: 20 })
    .withMessage("priceAfterDiscount is too long")
    .custom((value, { req }) => {
      if (value > req.body.price) {
        throw new Error("priceAfterDiscount must be less than price");
      }
      return true;
    }),

  check("price")
    .notEmpty()
    .withMessage("price is required")
    .isNumeric()
    .withMessage("price must be a number")
    .toFloat()
    .isLength({ max: 20 })
    .withMessage("price is too long"),

  check("colors")
    .isArray()
    .withMessage("Colors must be an array of string and not empty")
    .isArray({ min: 1 })
    .withMessage("Colors are required")
    .isLength({ max: 6 })
    .withMessage("Too many colors"),

  check("imageCover").notEmpty().withMessage("image Cover is required"),

  check("images").optional().isArray().withMessage("Images must be an array"),

  check("brandId")
    .notEmpty()
    .withMessage("Brand is required")
    .isMongoId()
    .withMessage("Invalid brand ID"),

  check("categoryId")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category ID")
    .custom(async (categoryId) => {
      const category = await categoryModel.exists({ _id: categoryId });
      if (!category) {
        return Promise.reject(new Error(`Invalid Category ID ${categoryId}`));
      }
      return true;
    }),

  check("subCategoryId")
    .notEmpty()
    .withMessage("Sub Category is required")
    .isArray({ min: 1 })
    .withMessage("Sub Category is required")
    .custom(async (subCategoriesId) => {
      const subCategories = await subCategoryModel.find({
        _id: { $in: subCategoriesId },
      });
      if (subCategories.length !== subCategoriesId.length) {
        return Promise.reject(
          new Error(`Invalid Sub Category ID ${subCategoriesId}`)
        );
      }
      return true;
    })
    .custom(async (subCategories, { req }) => {
      // Get all related sub categories that related to category
      const allRelatedSubCategory = await subCategoryModel.find({
        categoryId: req.body.categoryId,
      });
        // store only the id for the sub categoey
      const allRelatedSubCategoryId = allRelatedSubCategory.map((subCategory) =>
        subCategory._id.toString()
      );

      // return true if all of them inside the parent category
      const isSubCategoryRelatedToCategory = subCategories.every(
        (subCategoryId) => allRelatedSubCategoryId.includes(subCategoryId)
      );
      if (isSubCategoryRelatedToCategory) return true;
      return Promise.reject(
        new Error(
          `Not all sub categories ${req.body.subCategoryId} are related to category ${req.body.categoryId}`
        )
      );
    }),

  check("rating")
    .optional()
    .isNumeric()
    .withMessage("rating must be a number")
    .isLength({ min: 1 })
    .withMessage("rating is too short")
    .isLength({ max: 5 })
    .withMessage("rating is too long"),

  validatorMiddleware,
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid mongo id"),
  check("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Title is too short")
    .isLength({ max: 100 })
    .withMessage("Title is too long"),

  check("description")
    .optional()
    .isLength({ min: 20 })
    .withMessage("Description is too short")
    .isLength({ max: 200 })
    .withMessage("Description is too large"),

  check("quantity")
    .optional()
    .isNumeric()
    .withMessage("Quantity must be a number"),
  check("sold").optional().isNumeric().withMessage("sold must be a number"),

  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("priceAfterDiscount must be a number")
    .toFloat()
    .isLength({ max: 20 })
    .withMessage("priceAfterDiscount is too long")
    .custom((value, { req }) => {
      if (value > req.body.price) {
        throw new Error("priceAfterDiscount must be less than price");
      }
      return true;
    }),

  check("price")
    .optional()
    .isNumeric()
    .withMessage("price must be a number")
    .toFloat()
    .isLength({ max: 20 })
    .withMessage("price is too long"),

  check("colors")
    .optional()
    .isArray()
    .withMessage("Colors must be an array of string and not empty")
    .isArray({ min: 1 })
    .withMessage("Colors are required")
    .isLength({ max: 6 })
    .withMessage("Too many colors"),

  check("imageCover")
    .optional()
    .notEmpty()
    .withMessage("image Cover is required"),

  check("images").optional().isArray().withMessage("Images must be an array"),

  check("brandId").optional().isMongoId().withMessage("Invalid brand ID"),

  check("categoryId").optional().isMongoId().withMessage("Invalid category ID"),

  check("subCategoryId")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Sub Category is required")
    .custom((value) =>
      value.every((id) => check(id).isMongoId().withMessage("Invalid mongo id"))
    )
    .withMessage("Invalid Sub Category ID"),

  check("rating")
    .optional()
    .isNumeric()
    .withMessage("rating must be a number")
    .isLength({ min: 1 })
    .withMessage("rating is too short")
    .isLength({ max: 5 })
    .withMessage("rating is too long"),

  validatorMiddleware,
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid mongo id"),
  validatorMiddleware,
];
