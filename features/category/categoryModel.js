const mongoose = require("mongoose");
// 1- create a schema
const categorySchema = new mongoose.Schema(
  {
    id: String,
    name: {
      type: String,
      required: [true, "Category name is require !!!"],
      unique: [true, "Category name must be unique"],
      minlength: [3, "Category name is less than 3 character"],
      maxlength: [32, "Category name is more than 32 character"],
    },
    // Slug is the thing that is going to be send over the url "/location name"
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    imageUrl: String,
  },
  //this will create two thing for you created at , updated at
  { timestamps: true }
);
// 3- export the model

const updateImageUrlPath = (doc) => {
  //update the image to sending it to the api with full url

  if (doc.imageUrl) {
    doc.imageUrl = `${
      process.env.BASE_RUL || process.env.VERCEL_URL
    }/categories/${doc.imageUrl}`;
  }
  console.log("this fired after a document was saved");
};
categorySchema.post("init", updateImageUrlPath);
categorySchema.post("save", updateImageUrlPath);
// 2- create a model
const categoryModel = mongoose.model("category", categorySchema);

module.exports = categoryModel;
