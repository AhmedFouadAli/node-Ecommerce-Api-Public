const express = require("express");

const router = express.Router();

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changePassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
} = require("./userService");

const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changePasswordValidation,
  changeMyPasswordValidation,
  updateLoggedUserDataValidation,
} = require("./userValidator");

const { protect, allowTo } = require("../auth/authService");

router.get("/getMe", protect, getLoggedUserData, getUser);
router.put(
  "/changeMyPassword",
  protect,
  changeMyPasswordValidation,
  updateLoggedUserPassword
);
router.put(
  "/updateLoggedUserData",
  protect,
  updateLoggedUserDataValidation,
  updateLoggedUserData
);

router.put(
  "/changePassword/:id",
  protect,
  allowTo("admin"),
  changePasswordValidation,
  changePassword
);

router
  .route("/")
  .get(protect, allowTo("admin"), getUsers)
  .post(
    protect,
    allowTo("admin"),
    uploadUserImage,
    resizeImage,
    createUserValidator,
    createUser
  );

router
  .route("/:id")
  .get(protect, allowTo("admin"), getUserValidator, getUser)
  .put(
    protect,
    allowTo("admin"),
    uploadUserImage,
    resizeImage,
    updateUserValidator,
    updateUser
  )
  .delete(protect, allowTo("admin"), deleteUserValidator, deleteUser);

module.exports = router;
