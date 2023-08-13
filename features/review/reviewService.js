const asyncHandler = require("express-async-handler");

 const ReviewModel = require("./reviewModel");
const APIError = require("../../utils/apiError");


exports.getReviews = asyncHandler(async (req, res) => {
     let filterObject = {};
  if (req.params.productId) {
    filterObject = { product: req.params.productId };

  }
    const Reviews = await ReviewModel.find(filterObject)

  res.json({ result: Reviews.length , data: Reviews });
});

exports.getReview = asyncHandler(async (req, res, next) => {
  try {
    const Review = await ReviewModel.findById(req.params.id);
    if (!Review)
      return next(
        new APIError(404, `No Review found for this id :- ${req.params.id}`)
      );
    res.json(Review);
  } catch (e) {
    return next(
      new APIError(404, `No Review found for this id :- ${req.params.id}`)
    );
  }
});
exports.createReview = asyncHandler(async (req, res, next) => {
    if (req.params.productId) {
    req.body.product = req.params.productId;
  }
  const Review = new ReviewModel({
    ...req.body,
   });
  const document = await Review.save();
  res.json(document);
});

exports.updateReview = asyncHandler(async (req, res, next) => {
  try {

    const Review = await ReviewModel.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      {
        new: true,
      }
    );
    if (!Review) {
      return next(
        new APIError(404, `No Review found for this id :- ${req.params.id}`)
      );
    }
    // This wil trigger the function to update the caculation on  the product
    Review.save();
    res.json(Review);
  } catch (e) {
    return next(
      new APIError(404, `No Review found for this id :- ${req.params.id}`)
    );
  }
});
exports.deleteReview = asyncHandler(async (req, res, next) => {
  try {
    const review = await ReviewModel.findByIdAndDelete(req.params.id);
    if (!review)
      return next(
        new APIError(404, `No review found for this id :- ${req.params.id}`)
      );

          ReviewModel.calculationAverageRating(review.product);



    res.json(review);
  } catch (e) {
    return next(
      new APIError(404, `error:${e} `)
    );
  }
});
