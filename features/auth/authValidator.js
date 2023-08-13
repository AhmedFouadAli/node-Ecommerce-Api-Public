const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const slugify = require("slugify");

const UserModel = require("../user/userModel");
const bcrypt = require("bcryptjs");

exports.signUpValidator = [
  // Validating name and generate the slugify
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  // Validating email
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
  // Validating password
  check("password").notEmpty().withMessage("Password is required"),
  check("password").isLength({ min: 6 }).withMessage("Password is too short"),
  check("password").isLength({ max: 50 }).withMessage("Password is too long"),

  // Validating confirmPassword
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

  validatorMiddleware,
];

exports.signInValidator = [
  // Validating email
  check("email").notEmpty().withMessage("Email is required"),
  check("email").isEmail().withMessage("Invalid email format"),

  // Validating password
  check("password").notEmpty().withMessage("Password is required"),
  check("password").isLength({ min: 6 }).withMessage("Password is too short"),
  check("password").isLength({ max: 50 }).withMessage("Password is too long"),

  // Validating confirmPassword

  validatorMiddleware,
];

exports.forgetPasswordValidator = [
  // Validating email
  check("email").notEmpty().withMessage("Email is required"),
  check("email").isEmail().withMessage("Invalid email format"),
  validatorMiddleware,
];
exports.verifyRestCodeValidator = [
  // Validating email
  check("email").notEmpty().withMessage("Email is required"),
  check("email").isEmail().withMessage("Invalid email format"),
  // Validating code
  check("code").notEmpty().withMessage("Code is required"),
  check("code").isLength({ min: 6 }).withMessage("Code is too short"),
  check("code").isLength({ max: 6 }).withMessage("Code is too long"),

  validatorMiddleware,
];

exports.resetPasswordValidator = [
  // Validating email
  check("email").notEmpty().withMessage("Email is required"),
  check("email").isEmail().withMessage("Invalid email format"),
  // Validating password
  check("newPassword").notEmpty().withMessage("newPassword is required"),
  check("newPassword")
    .isLength({ min: 6 })
    .withMessage("newPassword is too short"),
  check("newPassword")
    .isLength({ max: 50 })
    .withMessage("newPassword is too long"),
  // Validating confirmPassword
  check("confirmNewPassword")
    .notEmpty()
    .withMessage("confirmNewPassword is required"),
  check("confirmNewPassword")
    .isLength({ min: 6 })
    .withMessage("confirmNewPassword is too short"),
  check("confirmNewPassword")
    .isLength({ max: 50 })
    .withMessage("confirmNewPassword is too long"),

  check("confirmNewPassword").custom((val, { req }) => {
    if (val !== req.body.newPassword) {
      throw new Error("newPassword and confirmNewPassword  not match");
    }
    return true;
  }),

  validatorMiddleware,
];
