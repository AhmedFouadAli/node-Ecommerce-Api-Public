// This to add - for the name on the slug field
const slugify = require("slugify");
// This to send the error to express so the handling of the error now is sending to the middleware layer
const asyncHandler = require("express-async-handler");
const BrandModel = require("./brandModel");
// for handling the error
const APIError = require("../../utils/apiError");

// handling the error earlier before sending it to the database:
exports.getBrands = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) - 1 || 0;
  const limit = 10;
  const numberSkipItem = limit * page;

  const brands = await BrandModel.find().skip(numberSkipItem).limit(limit);

  res.json({
    result: brands.length,
    page: page + 1,
    data: brands,
  });
});

exports.getBrand = asyncHandler(async (req, res, next) => {
  try {
    const brand = await BrandModel.findById(req.params.id);

    if (!brand)
      return next(
        new APIError(404, `No sub brand found for this id :- ${req.params.id}`)
      );
    res.json(brand);
  } catch (e) {
    return next(
      new APIError(404, `No sub brand found for this id :- ${req.params.id}`)
    );
  }
});
exports.createBrand = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const Brand = new BrandModel({
    name,
    slug: slugify(req.body.name),
  });

  const document = await Brand.save();
  console.log(document);

  res.json(document);
});

exports.updateBrand = asyncHandler(async (req, res, next) => {
  try {
    const { name } = req.body;
    const Brand = await BrandModel.findByIdAndUpdate(
      req.params.id,
      { name, slug: slugify(name) },

      // to return new category: after update not before update
      {
        new: true,
      }
    );
    if (!Brand)
      return next(
        new APIError(
          404,
          `No sub brand found for this id :- ${req.params.id}`
        )
      );
    res.json(Brand);
  } catch (e) {
    return next(
      new APIError(404, `No sub Category found for this id :- ${req.params.id}`)
    );
  }
});
exports.deleteBrand = asyncHandler(async (req, res, next) => {
  try {
    const brand = await BrandModel.findByIdAndDelete(req.params.id);
    if (!brand)
      return next(
        new APIError(404, `No  brand found for this id :- ${req.params.id}`)
      );
    res.json(brand);
  } catch (e) {
    return next(
      new APIError(404, `No  brand found for this id :- ${req.params.id}`)
    );
  }
});
