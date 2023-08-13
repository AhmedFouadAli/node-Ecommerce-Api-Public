const express = require("express");

const router = express.Router();

const { getWhichList,

  addProductToWhichList,
  removeProductFromWhichList

} = require("./whichListService");

const {
  checkProductIdWhichListValidator,
} = require("./userValidator");

const { protect, allowTo } = require("../auth/authService");

router.use(protect,allowTo("user"),

)

router
  .route("/")
  .get(getWhichList)
  .post(

    checkProductIdWhichListValidator,
    addProductToWhichList,
  );

router
  .route("/:productId")
  .delete(

    checkProductIdWhichListValidator,
    removeProductFromWhichList
  )


module.exports = router;
