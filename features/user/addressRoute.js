const express = require("express");

const router = express.Router();

const { getAddress,

  addAddressToAddress,
  removeAddressFromAddress

} = require("./addressService");



const { protect, allowTo } = require("../auth/authService");

router.use(protect,allowTo("user"),

)

router
  .route("/")
  .get(getAddress)
  .post(
     addAddressToAddress,
  );

router
  .route("/:addressId")
  .delete(
     removeAddressFromAddress
  )


module.exports = router;
