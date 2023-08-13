const mongoose = require("mongoose");
// 1- create a schema
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter the name of the brand"],
      unique: [true, "brand name must be unique"],
      trim: true,
      maxlength: [32, "A brand name too long"],
      minlength: [2, "A brand name too short"],
    },
    slug: {
      type: String,
      lowercase: true,
    },

    image: {
      type: String,
      default: "no-photo.jpg",
    },
  },
  //this will create two thing for you created at , updated at
  { timestamps: true }
);
// 2- create a model
const brandCategoryModel = mongoose.model("brand", brandSchema);

module.exports = brandCategoryModel;
