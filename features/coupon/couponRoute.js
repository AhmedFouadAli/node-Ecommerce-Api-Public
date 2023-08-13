const express = require("express");

const router = express.Router();

const {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("./couponService");
const { protect, allowTo } = require("../auth/authService");


const {
  getCouponValidator,
  createCouponValidator,
  updateCouponValidator,
  deleteCouponValidator,

} = require("./couponValidator");

router.use(protect, allowTo("admin"))

router
  .route("/")
  .get(getCoupons)
  .post( createCouponValidator, createCoupon);

router
  .route("/:id")
  .get(getCouponValidator, getCoupon)
  .put( updateCouponValidator, updateCoupon)
  .delete( deleteCouponValidator, deleteCoupon);

module.exports = router;
