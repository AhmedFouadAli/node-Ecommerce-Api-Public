/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
// This to add - for the name on the slug field
const slugify = require("slugify");
// This to send the error to express so the handling of the error now is sending to the middleware layer
const asyncHandler = require("express-async-handler");
const {
  uploadSingleImage,
} = require("../../middlewares/uploadImageMiddleware");

const { v4: uuidv4 } = require("uuid");

const CategoryModel = require("./categoryModel");
// for handling the error
// handling the error earlier before sending it to the database:
const APIError = require("../../utils/apiError");

// For working with image processing:
const sharp = require("sharp");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  // this is to make the name of the image unique
  const uniqueSuffix = `category-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/categories/${uniqueSuffix}`);

  req.body.imageUrl = uniqueSuffix;
  console.log(req.body);
  next();
});

// For images:
// here is the name of the field in mongodb
// this is the same what the front will sending data to you
exports.uploadCategoryImage = uploadSingleImage("categories", "imageUrl");

exports.getCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) - 1 || 0;
  const limit = 50;
  const numberSkipItem = limit * page;
  const categories = await CategoryModel.find()
    .skip(numberSkipItem)
    .limit(limit);

  res.json({
    result: categories.length,
    page: page + 1,
    data: categories,
  });
});

exports.getCategory = asyncHandler(async (req, res, next) => {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category)
      return next(
        new APIError(404, `No category found for this id :- ${req.params.id}`)
      );
    res.json(category);
  } catch (e) {
    return next(
      new APIError(404, `No category found for this id :- ${req.params.id}`)
    );
  }
});
exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = new CategoryModel({
    ...req.body,

    slug: slugify(req.body.name),
  });

  const document = await category.save();
  console.log(document);

  res.json(document);
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const category = await CategoryModel.findByIdAndUpdate(
      req.params.id,
      { ...req.body },

      // to return new category: after update not before update
      {
        new: true,
      }
    );
    if (!category) {
      console.log(category);
      return next(
        new APIError(404, `No category found for this id :- ${req.params.id}`)
      );
    }
    res.json(category);
  } catch (e) {
    return next(
      new APIError(404, `No category found for this id :- ${req.params.id}`)
    );
  }
});
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  try {
    const category = await CategoryModel.findByIdAndDelete(req.params.id);
    if (!category)
      return next(
        new APIError(404, `No category found for this id :- ${req.params.id}`)
      );
    res.json(category);
  } catch (e) {
    return next(
      new APIError(404, `No category found for this id :- ${req.params.id}`)
    );
  }
});
