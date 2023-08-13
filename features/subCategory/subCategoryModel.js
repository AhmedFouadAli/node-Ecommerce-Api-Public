const mongoose = require("mongoose");
// 1- create a schema
const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter the name of the subCategory"],
      unique: [true, "subCategory name must be unique"],
      trim: true,
      maxlength: [32, "A subCategory name too long"],
      minlength: [2, "A subCategory name too short"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Please enter the description of the subCategory"],
      trim: true,
      maxlength: [200, "A subCategory description too large"],
      minlength: [5, "A subCategory description too short"],
    },
    // This is like the forign key if we are working with sql
    categoryId: {
      type: mongoose.Schema.ObjectId,
      ref: "category",
      required: [true, "Please enter the category of the subCategory"],
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  //this will create two thing for you created at , updated at
  { timestamps: true }
);
// 2- create a model
const SubCategoryModel = mongoose.model("SubCategory", subCategorySchema);

module.exports = SubCategoryModel;
