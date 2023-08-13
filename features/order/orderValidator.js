const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getCouponValidator = [
  check("id").isMongoId().withMessage("Invalid mongo id"),
  validatorMiddleware,
];

exports.createCouponValidator = [
   check("code").notEmpty().withMessage("Coupon code is required"),
  check("discount")
    .notEmpty()
    .withMessage("Coupon discount is required")
    .isNumeric()
    .isInt({ min: 0, max: 100 })
    .withMessage("Coupon discount must be between 0 and 100"),
  check("expire").notEmpty().withMessage("Coupon expiration date is required").isDate().withMessage("Invalid date format for expiration date"),
  validatorMiddleware,
];

exports.updateCouponValidator = [
   check("code").optional().notEmpty().withMessage("Coupon code is required"),
  check("discount")
    .optional().notEmpty()
    .optional().withMessage("Coupon discount is required")
    .optional().isNumeric()
    .optional().isInt({ min: 0, max: 100 })
    .optional().withMessage("Coupon discount must be between 0 and 100"),
  check("expire").optional().notEmpty().withMessage("Coupon expiration date is required")
    .isDate().withMessage("Invalid date format for expiration date"),
  validatorMiddleware,
];

exports.deleteCouponValidator = [
  check("id").isMongoId().withMessage("Invalid mongo id"),
  validatorMiddleware,
];
