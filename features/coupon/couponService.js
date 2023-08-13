// This to add - for the name on the slug field
const slugify = require("slugify");
// This to send the error to express so the handling of the error now is sending to the middleware layer
const asyncHandler = require("express-async-handler");
const CouponModel = require("./couponModel");
// for handling the error
const APIError = require("../../utils/apiError");

// handling the error earlier before sending it to the database:
exports.getCoupons = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) - 1 || 0;
  const limit = 10;
  const numberSkipItem = limit * page;

  const Coupons = await CouponModel.find().skip(numberSkipItem).limit(limit);

  res.json({
    result: Coupons.length,
    page: page + 1,
    data: Coupons,
  });
});

exports.getCoupon = asyncHandler(async (req, res, next) => {
  try {
    const Coupon = await CouponModel.findById(req.params.id);

    if (!Coupon)
      return next(
        new APIError(404, `No  Coupon found for this id :- ${req.params.id}`)
      );
    res.json(Coupon);
  } catch (e) {
    return next(
      new APIError(404, `No  Coupon found for this id :- ${req.params.id}`)
    );
  }
});
exports.createCoupon = asyncHandler(async (req, res, next) => {
   const Coupon = new CouponModel({
    ...req.body
  });

  const document = await Coupon.save();
  console.log(document);

  res.json(document);
});

exports.updateCoupon = asyncHandler(async (req, res, next) => {
  try {

    const Coupon = await CouponModel.findByIdAndUpdate(
      req.params.id,
      { ...req.body },

      // to return new category: after update not before update
      {
        new: true,
      }
    );
    if (!Coupon)
      return next(
        new APIError(
          404,
          `No  Coupon found for this id :- ${req.params.id}`
        )
      );
    res.json(Coupon);
  } catch (e) {
    return next(
      new APIError(404, `No  Category found for this id :- ${req.params.id}`)
    );
  }
});
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  try {
    const Coupon = await CouponModel.findByIdAndDelete(req.params.id);
    if (!Coupon)
      return next(
        new APIError(404, `No  Coupon found for this id :- ${req.params.id}`)
      );
    res.json(Coupon);
  } catch (e) {
    return next(
      new APIError(404, `No  Coupon found for this id :- ${req.params.id}`)
    );
  }
});
