const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid mongo id"),
  validatorMiddleware,
];

exports.createCategoryValidator = [
  check("name").notEmpty().withMessage("Name is required"),
  check("name").isLength({ min: 3 }).withMessage("Name is too short"),
  check("name").isLength({ max: 32 }).withMessage("Name is too long"),
  validatorMiddleware,
];

exports.updateCategoryValidator = [
  check("id").optional().isMongoId().withMessage("Invalid mongo id"),
  check("name").optional().notEmpty().withMessage("Name is required"),
  check("name").optional().isLength({ min: 3 }).withMessage("Name is too short"),
  check("name").optional().isLength({ max: 32 }).withMessage("Name is too long"),
  validatorMiddleware,
];

exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid mongo id"),
  validatorMiddleware,
];
