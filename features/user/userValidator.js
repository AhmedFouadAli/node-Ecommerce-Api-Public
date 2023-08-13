const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const slugify = require("slugify");

const UserModel = require("./userModel");
const bcrypt = require("bcryptjs");

exports.checkProductIdWhichListValidator = [
  check("productId").isMongoId().withMessage("Invalid mongo id"),
  validatorMiddleware,
];
exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid mongo id"),
  validatorMiddleware,
];

exports.changePasswordValidation = [
  check("id").isMongoId().withMessage("Invalid mongo id"),
  check("password").notEmpty().withMessage("Password is required"),
  check("password").isLength({ min: 6 }).withMessage("Password is too short"),
  check("password").isLength({ max: 50 }).withMessage("Password is too long"),

  check("newPassword").notEmpty().withMessage("newPassword is required"),
  check("newPassword")
    .isLength({ min: 6 })
    .withMessage("newPassword is too short"),
  check("newPassword")
    .isLength({ max: 50 })
    .withMessage("newPassword is too long"),

  check("confirmPassword")
    .notEmpty()
    .withMessage("confirmPassword is required"),
  check("confirmPassword")
    .isLength({ min: 6 })
    .withMessage("confirmPassword is too short"),
  check("confirmPassword")
    .isLength({ max: 50 })
    .withMessage("confirmPassword is too long")
    .custom((val, { req }) => {
      if (val !== req.body.newPassword) {
        throw new Error("newPassword and confirmPassword  not match");
      }
      return true;
    }),

  check("password").custom(async (val, { req }) => {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      throw new Error("User not found");

    }
    const userPassword = user.password;
    const isMatch = await bcrypt.compare(val, userPassword);
    if (!isMatch) {
      throw new Error("Password is incorrect");
    }
    return true;
  }),
  validatorMiddleware,
];
exports.changeMyPasswordValidation = [
  check("password").notEmpty().withMessage("Password is required"),
  check("password").isLength({ min: 6 }).withMessage("Password is too short"),
  check("password").isLength({ max: 50 }).withMessage("Password is too long"),

  check("newPassword").notEmpty().withMessage("newPassword is required"),
  check("newPassword")
    .isLength({ min: 6 })
    .withMessage("newPassword is too short"),
  check("newPassword")
    .isLength({ max: 50 })
    .withMessage("newPassword is too long"),

  check("confirmPassword")
    .notEmpty()
    .withMessage("confirmPassword is required"),
  check("confirmPassword")
    .isLength({ min: 6 })
    .withMessage("confirmPassword is too short"),
  check("confirmPassword")
    .isLength({ max: 50 })
    .withMessage("confirmPassword is too long")
    .custom((val, { req }) => {
      if (val !== req.body.newPassword) {
        throw new Error("newPassword and confirmPassword  not match");
      }
      return true;
    }),

  check("password").custom(async (val, { req }) => {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      throw new Error("User not found");

    }
    const userPassword = user.password;
    const isMatch = await bcrypt.compare(val, userPassword);
    if (!isMatch) {
      throw new Error("Password is incorrect");
    }
    return true;
  }),
  validatorMiddleware,
];
exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email").notEmpty().withMessage("Email is required"),
  check("email")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (val) => {
      const userWithSameEmail = await UserModel.findOne({
        email: val,
      });
      if (userWithSameEmail) {
        throw new Error("Email already exists stop");
      }

      return true;
    }),

  check("password").notEmpty().withMessage("Password is required"),
  check("password").isLength({ min: 6 }).withMessage("Password is too short"),
  check("password").isLength({ max: 50 }).withMessage("Password is too long"),

  check("confirmPassword")
    .notEmpty()
    .withMessage("confirmPassword  is required"),
  check("confirmPassword")
    .isLength({ min: 6 })
    .withMessage("confirmPassword  is too short"),
  check("confirmPassword")
    .isLength({ max: 50 })
    .withMessage("confirmPassword  is too long")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password and confirmPassword  not match");
      }
      return true;
    }),

  check("password").isLength({ min: 6 }).withMessage("Password is too short"),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number format"),

  validatorMiddleware,
];
exports.updateUserValidator = [
  check("name").optional().notEmpty().withMessage("Name is required"),

  check("email").optional().notEmpty().withMessage("Email is required"),
  check("email").optional().isEmail().withMessage("Invalid email format"),

  check("password").optional().notEmpty().withMessage("Password is required"),
  check("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password is too short"),
  check("password")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Password is too long"),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number format"),
  validatorMiddleware,
];
exports.updateLoggedUserDataValidation = [
  check("name").optional().notEmpty().withMessage("Name is required"),

  check("email").optional().notEmpty().withMessage("Email is required"),
  check("email").optional().isEmail().withMessage("Invalid email format")
  .custom(async (val) => {
      const userWithSameEmail = await UserModel.findOne({
        email: val,
      });
      if (userWithSameEmail) {
        throw new Error("Email already exists stop");
      }

      return true;
    }),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number format"),

  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid mongo id"),
  validatorMiddleware,
];
