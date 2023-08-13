const express = require("express");

const router = express.Router();

const {
  signUp,
  signIn,
  forgetPassword,
  verifyRestCode,
  resetPassword,
} = require("./authService");

const {
  signUpValidator,
  signInValidator,
  forgetPasswordValidator,
  verifyRestCodeValidator,
  resetPasswordValidator,
} = require("./authValidator");

router.post("/signUp", signUpValidator, signUp);
router.post("/signIn", signInValidator, signIn);
router.post("/forgetPassword", forgetPasswordValidator, forgetPassword);
router.post("/verifyRestCode", verifyRestCodeValidator, verifyRestCode);
router.put("/resetPassword", resetPasswordValidator, resetPassword);

module.exports = router;
