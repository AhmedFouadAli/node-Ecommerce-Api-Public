// This to add - for the name on the slug field
const slugify = require("slugify");
// This to send the error to express so the handling of the error now is sending to the middleware layer
const asyncHandler = require("express-async-handler");
const SubCategoryModel = require("./subCategoryModel");
// for handling the error
const APIError = require("../../utils/apiError");

exports.setCategoryId = (req, res, next) => {
  // Allow nested routes
  if (!req.body.categoryId) req.body.categoryId = req.params.categoryId;
  next();
}

// handling the error earlier before sending it to the database:

exports.getSubCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) - 1 || 0;
  let limit = 10;
  const numberSkipItem = limit * page;

  let filterObject = {};
  if (req.params.categoryId) {
    filterObject = { categoryId: req.params.categoryId };
    limit =0;

  }

  const subCategories = await SubCategoryModel.find(filterObject)
    .skip(numberSkipItem)
    .limit(limit)
    // For return the information of the parent
    // .populate("categoryId");
    // For return sub  information of the parent so here will return only the name of the parent - to remove field
    // note it add two query one for the current second to get information form parent
    .populate("categoryId", "name ");

  res.json({
    result: subCategories.length,
    page: page + 1,
    data: subCategories,
  });
});

exports.getSubCategory = asyncHandler(async (req, res, next) => {
  try {
    const category = await SubCategoryModel.findById(req.params.id);

    if (!category)
      return next(
        new APIError(
          404,
          `No sub category found for this id :- ${req.params.id}`
        )
      );
    res.json(category);
  } catch (e) {
    return next(
      new APIError(404, `No sub category found for this id :- ${req.params.id}`)
    );
  }
});
exports.createSubCategory = asyncHandler(async (req, res, next) => {
  const { name, description, categoryId } = req.body;
  const subCategory = new SubCategoryModel({
    name,
    description,
    categoryId,
    slug: slugify(req.body.name),
  });

  const document = await subCategory.save();
  console.log(document);

  res.json(document);
});

exports.updateSubCategory = asyncHandler(async (req, res, next) => {
  try {
    const { name, description, categoryId } = req.body;
    const subCategory = await SubCategoryModel.findByIdAndUpdate(
      req.params.id,
      { name, description, categoryId, slug: slugify(req.body.name) },

      // to return new category: after update not before update
      {
        new: true,
      }
    );
    if (!subCategory)
      return next(
        new APIError(
          404,
          `No sub category found for this id :- ${req.params.id}`
        )
      );
    res.json(subCategory);
  } catch (e) {
    return next(
      new APIError(404, `No sub Category found for this id :- ${req.params.id}`)
    );
  }
});
exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
  try {
    const subCategory = await SubCategoryModel.findByIdAndDelete(req.params.id);
    if (!subCategory)
      return next(
        new APIError(
          404,
          `No sub category found for this id :- ${req.params.id}`
        )
      );
    res.json(subCategory);
  } catch (e) {
    return next(
      new APIError(404, `No sub category found for this id :- ${req.params.id}`)
    );
  }
});
