const express = require("express");

const router = express.Router(
  { mergeParams: true } // to get the params from the parent router
);

const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require("./reviewService");

const { protect, allowTo } = require("../auth/authService");
// protect,
//     allowTo("admin"),

const {
  getReviewValidator,
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("./reviewValidator");

router
  .route("/")
  .get(getReviews)

  .post(
    protect,
    allowTo("user"),
    createReviewValidator,
    createReview
  );

router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(
    protect,
    allowTo("user"),
    updateReviewValidator,
    updateReview
  )
  .delete(protect, allowTo("admin","user"), deleteReviewValidator, deleteReview);

module.exports = router;
