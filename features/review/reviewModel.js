const mongoose = require("mongoose");
const ProductModel = require("../product/productModel")
// 1- create a schema
const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    rating: {
      type: Number,
      min: [1, "The min is 1"],
      max: [5, "The max is 5"],
      require:[true,"Please enter the rating"]
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      require: [true, "Review must belong to user"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      require: [true, "Review must belong to Product"],
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email",
  });
  next();
})

reviewSchema.statics.calculationAverageRating = async function (productId) {
  // this point to the current model
  // this is a query
  const result=await  this.aggregate([
    {
      // to get only specific product id
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        // it will sum all of them and divide by their number
        averageRating: { $avg: "$rating" },
        // like counter each only will be by one so 3 will be 1+1+1
        numberOfRating: { $sum: 1 },
      },
    },
  ]);

  console.log(result);
  if (result.length > 0) {

    await ProductModel.findByIdAndUpdate(
      productId,
      {
        ratingQuantity: result[0].numberOfRating,
        rating: result[0].averageRating,
      },
      )
  } else {
     await ProductModel.findByIdAndUpdate(
      productId,
      {
        ratingQuantity: 0,
        rating: 0,
      },
      )

    }


}

reviewSchema.post("save",
  function () {
    // this point to the current document
    // this.constructor point to the current model
    this.constructor.calculationAverageRating(this.product);
  }

  )
reviewSchema.post("remove",
  function () {
    // this point to the current document
    // this.constructor point to the current model
    this.constructor.calculationAverageRating(this.product);
  }

  )
const reviewModel = mongoose.model("Review", reviewSchema);

module.exports = reviewModel;
