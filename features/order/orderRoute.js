const express = require("express");

const router = express.Router();

const {
  createCashOrder,
  getOrders,
  getOrder,
  updateOrderState,
  checkOut,
} = require("./orderService");
const { protect, allowTo } = require("../auth/authService");

router.use(protect);

router.get("/checkout-session/:shoppingCartId",allowTo("user"), checkOut);

router
  .route("/")
  .post(allowTo("user"), createCashOrder)
  .get(allowTo("user"), getOrders);

  router
    .route("/:orderId")
    .get(allowTo("user"), getOrder)
    .put(allowTo("admin"), updateOrderState);
module.exports = router;
