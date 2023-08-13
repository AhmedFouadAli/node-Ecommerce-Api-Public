/* eslint-disable no-return-assign */
/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
// This to add - for the name on the slug field
const slugify = require("slugify");
// This to send the error to express so the handling of the error now is sending to the middleware layer
const asyncHandler = require("express-async-handler");
const ProductModel = require("./productModel");
// for handling the error
const APIError = require("../../utils/apiError");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const ApiFeature = require("../../utils/apiFeature");
const {
  uploadMultiImages,
} = require("../../middlewares/uploadImageMiddleware");

exports.uploadProductImages = uploadMultiImages(
  "products",
  "imageCover",
  "images"
);

exports.resizeImage = asyncHandler(async (req, res, next) => {
  console.log(req.files);
  if (req.files.imageCover) {
    const uniqueSuffix = `product-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/products/${uniqueSuffix}`);
    req.body.imageCover = uniqueSuffix;
  }
  const images = [];

  if (req.files.images) {
    console.log("inside");

    // // this is to make the name of the image unique
     req.files.images.forEach((f) => {
       const uniqueSuffixImages = `product-${uuidv4()}-${Date.now()}.jpeg`;

       sharp(f.buffer)
         .resize(2000, 1333)
         .toFormat("jpeg")
         .jpeg({ quality: 90 })
         .toFile(`uploads/products/${uniqueSuffixImages}`);
       console.log(uniqueSuffixImages);

       images.push(uniqueSuffixImages);
     });
    req.body.images = images

  }

  console.log("Start printing body");
  console.log(req.body);
  console.log(images);
  next();
});
exports.getProducts = asyncHandler(async (req, res) => {
  const documents = await ProductModel.countDocuments();
  const apiFeature = new ApiFeature(ProductModel.find(), req.query)
    .pagination(documents)
    .filter()
    .sort()
    .limitFieldList()
    .search();

  const products = await apiFeature.mongooseQuery;
  res.json({
    result: products.length,
    page: apiFeature.pagenationResult,
    data: products,
  });
});
// exports.getProducts = asyncHandler(async (req, res) => {
//    // 1) pagination
//   const page = parseInt(req.query.page, 10) - 1 || 0;
//   const limit = 10;
//   const numberSkipItem = limit * page;

//   // 2) filtering
//   let queryObject = { ...req.query };
//   // for removing it from the filter sine they are using for other things:
//   const excludedFields = ["sort", "page", "limit", "fields", "q"];
//   excludedFields.forEach((keyToRemove) => delete queryObject[keyToRemove]);

//   // 3)filtering with operation
//   let queryString = JSON.stringify(queryObject);
//   queryString = queryString.replace(
//     /(gte|gt|lte|lt)\b/g,
//     (match) => `$${match}`
//   );

//   queryObject = JSON.parse(queryString);

//   let buildQuery = ProductModel.find(queryObject)
//     // or using here where("rating").equals(req.query.rating) but not recommended
//     .skip(numberSkipItem)
//     .limit(limit);

//   //4- sorting by fields
//   if (req.query.sort) {
//     // sort=-price from large to small
//     // Sorting by more than one field if two of them same in the first field
//     const splitSort = req.query.sort.split(",");

//     buildQuery = buildQuery.sort(splitSort.join(" "));
//   } else {
//     buildQuery = buildQuery.sort("createdAt");
//   }
//   // 5-selecting number of fields
//   if (req.query.fields) {
//     const requestFields = `${req.query.fields},-__v`;
//     buildQuery = buildQuery.select(requestFields.split(","));
//   } else {
//     buildQuery = buildQuery.select("-__v");
//   }

//   // 6-searching
//   if (req.query.q) {
//     console.log(req.query.q);
//     const query = {};
//     query.$or = [
//       {
//         title: { $regex: req.query.q, $options: "i" },
//       },
//       { description: { $regex: req.query.q, $options: "i" } },
//     ];
//     buildQuery = buildQuery.find(query);
//   }

//   const products = await buildQuery;
//   res.json({
//     result: products.length,
//     page: page + 1,
//     data: products,
//   });
// });

exports.getProduct = asyncHandler(async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id).populate(
      "reviews"

    );
    if (!product)
      return next(
        new APIError(404, `No product found for this id :- ${req.params.id}`)
      );
    res.json(product);
  } catch (e) {
    return next(
      new APIError(404, `No product found for this id :- ${req.params.id}`)
    );
  }
});
exports.createProduct = asyncHandler(async (req, res, next) => {
  req.body.slug = slugify(req.body.title);
  const Product = new ProductModel(req.body);

  const document = await Product.save();
  console.log(document);

  res.json(document);
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  try {
    if (req.body.title) req.body.slug = slugify(req.body.title);
    console.log(req.body);
    const Product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      req.body,

      // to return new product: after update not before update
      {
        new: true,
      }
    );
    if (!Product)
      return next(
        new APIError(404, `No product found for this id :- ${req.params.id}`)
      );
    res.json(Product);
  } catch (e) {
    return next(
      new APIError(404, `No product found for this id :- ${req.params.id}`)
    );
  }
});
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  try {
    const Product = await ProductModel.findByIdAndDelete(req.params.id);
    if (!Product)
      return next(
        new APIError(404, `No product found for this id :- ${req.params.id}`)
      );
    res.json(Product);
  } catch (e) {
    return next(
      new APIError(404, `No product found for this id :- ${req.params.id}`)
    );
  }
});
