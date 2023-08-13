const express = require("express");

const router = express.Router();

const {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} = require("./brandService");
const { protect, allowTo } = require("../auth/authService");


const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,

} = require("./brandValidator");

router
  .route("/")
  .get(getBrands)
  .post(protect, allowTo("admin"), createBrandValidator, createBrand);

router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(protect, allowTo("admin"), updateBrandValidator, updateBrand)
  .delete(protect, allowTo("admin"), deleteBrandValidator, deleteBrand);

module.exports = router;
