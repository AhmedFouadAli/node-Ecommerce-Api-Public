const express = require("express");

const router = express.Router(
  { mergeParams: true } // to get the params from the parent router
);
const reviewRoute = require("../review/reviewRoute");

router.use("/:productId/review", reviewRoute);


const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeImage,
} = require("./productService");

const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,

} = require("./productValidator");

router
  .route("/")
  .get(getProducts)
  .post(
    uploadProductImages,
    resizeImage,
    createProductValidator,
    createProduct
  );

router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(uploadProductImages, resizeImage, updateProductValidator, updateProduct)
  .delete(deleteProductValidator, deleteProduct);

module.exports = router;
