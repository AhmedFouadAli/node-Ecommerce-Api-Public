const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid mongo id"),

  validatorMiddleware,
];
exports.getAllSubCategoryValidator = [
  check("categoryId").optional().isMongoId().withMessage("Invalid mongo id"),

  validatorMiddleware,
];

exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name is too short")
    .isLength({ max: 32 })
    .withMessage("Name is too long"),

  check("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 5 })
    .withMessage("Description is too short")
    .isLength({ max: 200 })
    .withMessage("Description is too large"),

  check("categoryId")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category ID"),
  validatorMiddleware,
];

exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid mongo id"),
  check("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Name is too short")
    .isLength({ max: 32 })
    .withMessage("Name is too long"),

  check("description")
    .optional()
    .isLength({ min: 5 })
    .withMessage("Description is too short")
    .isLength({ max: 200 })
    .withMessage("Description is too large"),

  check("categoryId").optional().isMongoId().withMessage("Invalid category ID"),
  validatorMiddleware,
  validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid mongo id"),
  validatorMiddleware,
];
