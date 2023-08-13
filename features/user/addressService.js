const asyncHandler = require("express-async-handler");

 const UserModel = require("./userModel");
const APIError = require("../../utils/apiError");


exports.getAddress = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user.id);

  res.json({ result: user.address.length , data: user.address });
});
exports.addAddressToAddress = asyncHandler(async (req, res, next) => {
  try {
     // Find the user by ID and check if any address with the same values exists

    const user =await UserModel.findByIdAndUpdate(
      req.user.id,
      {
          $addToSet: {
          address:  req.body,
        },
      },
      {
        new:true
      }
    )
    console.log(user);

    res.json({
      status: "success",
      message:"address added successfully",
      data: user.address,
    });

  } catch (e) {
    return next(
      new APIError(404, `${e}`)
    );
  }

});

exports.removeAddressFromAddress = asyncHandler(async (req, res, next) => {
  try {

    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
        // Removing from the array (if productId exists in the wishlist)
  {  $pull: {
    address:
      {
      _id: req.params.addressId,
      }
    ,
    },},

      {
        new: true,
      }
    );
        res.json({
      status: "success",
      message:"address removed successfully",
      data: user.address,
    });




  } catch (e) {
    return next(
      new APIError(404, `No Address found for this id :- ${req.params.id}`)
    );
  }
});

