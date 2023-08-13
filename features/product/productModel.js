const mongoose = require("mongoose");
// 1- create a schema
const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter the title of the Product"],
      unique: [true, "Product title must be unique"],
      trim: true,
      maxlength: [100, "A Product title too long"],
      minlength: [3, "A Product title too short"],
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please enter the description of the Product"],
      trim: true,
      maxlength: [1000, "A Product description too large"],
      minlength: [20, "A Product description too short"],
    },
    quantity: {
      type: Number,
      required: [true, "Please enter the quantity of the Product"],
    },
    sold: {
      type: Number,
      default: 0,
      required: [true, "Please enter the quantity of the Product"],
    },
    price: {
      type: Number,
      required: [true, "Please enter the price of the Product"],
      trim: true,
      max: [100000, "A Product new price too long"],
    },
    priceAfterDiscount: {
      type: Number,
      trim: true,
      max: [100000, "A Product price After Discount too long"],
    },

    colors: {
      type: [String],
      required: [true, "Please enter the colors of the Product"],
      trim: true,
      maxlength: [6, "A Product colors too long"],
      minlength: [1, "A Product colors too short"],
    },
    images: {
      type: [String],
    },
    imageCover: {
      type: String,
      required: [true, "Please enter the image Cover of the Product"],
    },
    brandId: {
      type: mongoose.Schema.ObjectId,
      ref: "brand",
      required: [true, "Please enter the brand of the Product"],
    },

    categoryId: {
      type: mongoose.Schema.ObjectId,
      ref: "category",
      required: [true, "Please enter the category of the Product"],
    },
    // This is array of sub categories
    subCategoryId: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "SubCategory",
        required: [true, "Please enter the Sub Category of the Product"],
      },
    ],
    rating: {
      type: Number,
      default: 1,
      min: [1, "A Product rating must be at least 1"],
      max: [5, "A Product rating must can not be more than 5"],
    },
    ratingQuantity: {
      type: Number,
    }
  },
  //this will create two thing for you created at , updated at
  {
    timestamps: true,
    // To enable the virtuals columns popuate
    toJSON:
      { virtuals: true },
    toObject:
      { virtuals: true },


  }
);

// field which is created temporary
ProductSchema.virtual(
  "reviews"
  , {
    // refer to the schema name
    ref: "Review",
    // refer to the current product id name
    localField: "_id",
    // refer to the product in the review table
    foreignField: "product",
    justOne: false,
  }
)
ProductSchema.pre(/^find/, function (next) {
  this.populate({
    path: "categoryId",
    select: "name",
  });
  next();
});


// Mongoose middle ware:

const updateImageUrlPath = (doc) => {
  //update the image to sending it to the api with full url

  if (doc.imageCover) {
    doc.imageCover = `${
      process.env.BASE_RUL || process.env.VERCEL_URL
    }/products/${doc.imageCover}`;
  }

  if (doc.images) {
    doc.images = doc.images.map(
      (image) =>
        `${process.env.BASE_RUL || process.env.VERCEL_URL}/products/${image}`
    );
  }
};
ProductSchema.post("init", updateImageUrlPath);
ProductSchema.post("save", updateImageUrlPath);



// 2- create a model
const ProductModel = mongoose.model("Product", ProductSchema);

module.exports = ProductModel;
