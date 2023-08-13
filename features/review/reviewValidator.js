const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const ReviewModel=require("./reviewModel")

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid mongo id"),
  validatorMiddleware,
];

exports.createReviewValidator = [
  check("title").optional().isString().withMessage("Title must be a string"),
  check("rating").isNumeric().withMessage("Rating must be a number"),
  check("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5").custom((val, { req }) => {

    req.body.user = req.user.id;

    return true;

  }),
   check("product").optional().isMongoId().withMessage("Invalid product ID"),

  check("product").custom(async (val, { req }) => {
    const review = await ReviewModel.findOne(
      {
        product: val,
        user: req.user.id,
      }
    )


     if (review) {
      throw new Error("You can only create a review for yourself");
    }
    return true;
  }),

  validatorMiddleware,
];

exports.updateReviewValidator = [
    check("id").isMongoId().withMessage("Invalid mongo id"),

  check("title").optional().isString().withMessage("Title must be a string"),
  check("rating").optional().isNumeric().withMessage("Rating must be a number"),
  check("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  check("user").optional().isMongoId().withMessage("Invalid user ID"),
  check("product").optional().isMongoId().withMessage("Invalid product ID"),
    check("id").custom(async (val, { req }) => {
       const review = await ReviewModel.findById(
      val
      )
        if (!review) {
      throw new Error(`There is no review id with this one ${val}`);
      }


    if (review.user.id.toString() !== req.user.id   ) {
      throw new Error("You can only update your own  review for yourself");
    }
    return true;
  }),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id").isMongoId().withMessage("Invalid mongo id"),
  check("id").custom(async (val, { req }) => {
    const review = await ReviewModel.findById(
     val
     )
     if (!review) {
      throw new Error(`There is no review id with this one ${req.params.id}`);
    }
    if (review.user.id.toString() !== req.user.id && req.user.role ==="user") {
      throw new Error("You can only delete your own review");
    }
    return true;
  }),
  validatorMiddleware,
];
