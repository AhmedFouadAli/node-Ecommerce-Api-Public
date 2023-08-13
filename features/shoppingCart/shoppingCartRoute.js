const express = require("express");

const router = express.Router();

const {
  addProductToCart,
  getShoppingCart,
  removeProductFromCart,
  removeAllItems,
  updateQuantity,
  applyCouponToCart,
} = require("./shoppingCartService");
const { protect, allowTo } = require("../auth/authService");

router.use(protect);

router
  .route("/")
  .get(allowTo("user"), getShoppingCart)
  .post(allowTo("user"), addProductToCart)
  .delete(allowTo("user"), removeAllItems);

router.route("/:cartItemId").delete(allowTo("user"), removeProductFromCart);
 router.route("/updateQuantity").put(allowTo("user"), updateQuantity);
 router.route("/applyCouponToCart").put(allowTo("user"), applyCouponToCart);

// router
//   .route("/:id")
//   .get(getShoppingCartValidator, getShoppingCart)
//   .put( updateShoppingCartValidator, updateShoppingCart)
//   .delete( deleteShoppingCartValidator, deleteShoppingCart);

module.exports = router;
