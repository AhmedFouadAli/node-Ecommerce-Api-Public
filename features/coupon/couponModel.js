const mongoose = require("mongoose");
// 1- create a schema
const couponSchema = new mongoose.Schema(
  {
    code: {
    type: String,
    required: [true,"Coupon code is require"],
    unique: true,
    trim: true,
  },
  discount: {
    type: Number,
    required: [true,"Coupon discount is require"],
    min: 0,
    max: 100,
  },
  expire: {
    type: Date,
    required: [true,"Coupon expire date is require"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  },
  { timestamps: true }
);
const couponCategoryModel = mongoose.model("Coupon", couponSchema);

module.exports = couponCategoryModel;
