const asyncHandler = require("express-async-handler");

 const UserModel = require("./userModel");
const APIError = require("../../utils/apiError");


exports.getWhichList = asyncHandler(async (req, res) => {
  const whichList = await UserModel.findById(req.user.id).select("wishlist").populate(
    {
      path: "wishlist",


    }
  );

  res.json({ result: whichList.length , data: whichList });
});
exports.addProductToWhichList = asyncHandler(async (req, res, next) => {
  try {
    const user =await UserModel.findByIdAndUpdate(
      req.user.id,
      {
        // adding to the array :-
            // Adding to the array (only if the productId doesn't already exist in wishlist)
        $addToSet: {
          wishlist: req.body.productId,
        },
      },
      {
        new:true
      }
    )
    console.log(user);

    res.json({
      status: "success",
      message:"product added successfully",
      data: user.wishlist,
    });

  } catch (e) {
    return next(
      new APIError(404, `${e}`)
    );
  }

});

exports.removeProductFromWhichList = asyncHandler(async (req, res, next) => {
  try {

    const whichList = await UserModel.findByIdAndUpdate(
      req.user.id,
        // Removing from the array (if productId exists in the wishlist)
  {  $pull: {
      wishlist: req.params.productId,
    },},

      {
        new: true,
      }
    );
        res.json({
      status: "success",
      message:"product removed successfully",
      data: whichList.wishlist,
    });




  } catch (e) {
    return next(
      new APIError(404, `No whichList found for this id :- ${req.params.id}`)
    );
  }
});

