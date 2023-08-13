const asyncHandler = require("express-async-handler");
const ShoppingCartModel = require("./shoppingCartModel");
const ProductModel = require("../product/productModel");
const CouponModel = require("../coupon/couponModel");
const APIError = require("../../utils/apiError");

// handling the error earlier before sending it to the database:

const calcTotalPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });
  cart.totalPriceAfterDiscount=undefined;
  return totalPrice;
};
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  // Extract the productId and color from the request body
  const { productId, color } = req.body;

  // 1) Get the product data from the database using the productId
  const product = await ProductModel.findById(productId);

  // 2) Check if the product exists in the database
  if (!product) {
    return next(
      new APIError(404, `No Product found for this id :- ${productId}`)
    );
  }

  // 3) Check if the user has a shopping cart
  let cart = await ShoppingCartModel.findOne({ user: req.user.id });

  // The user has a shopping cart
  if (cart) {
    // Check if the product already exists in the cart
    const productExist = cart.cartItems.find(
      (item) =>
        item.product.toString() === productId.toString() && item.color === color
    );

    // If the product already exists in the cart, update its quantity and price
    if (productExist) {
      productExist.quantity += 1;
    } else {
      // If the product does not exist in the cart, add it as a new cart item
      cart.cartItems.push({
        product: productId,
        color: color,
        price: product.price,
      });
    }
  } else {
    // The user does not have a shopping cart, create a new shopping cart
    cart = await ShoppingCartModel.create({
      user: req.user.id,
      cartItems: [
        {
          product: productId,
          color: color,
          price: product.price,
        },
      ],
    });
  }

  cart.totalCartPrice = calcTotalPrice(cart);

  // 4) Save the updated cart to the database

  await cart.save();

  // 4) Send the response with the updated cart data
  res.status(200).json({
    status: "success",
    data: cart,
  });
});

exports.getShoppingCart = asyncHandler(async (req, res, next) => {
  const cart = await ShoppingCartModel.findOne({ user: req.user.id });
  if (!cart) {
    return next(
      new APIError(404, `There is no cart for this user = ${req.user.id}`)
    );
  }
  res.status(200).json({
    status: "success",
    numberOfCartItem: cart.cartItems.length,
    data: cart,
  });
});

exports.removeProductFromCart = asyncHandler(async (req, res, next) => {
  const cart = await ShoppingCartModel.findOneAndUpdate(
    { user: req.user.id },
    {
      $pull: { cartItems: { _id: req.params.cartItemId } },
    },

    { new: true }
  );
  if (!cart) {
    return next(
      new APIError(404, `There is no cart for this user = ${req.user.id}`)
    );
  }

  cart.totalCartPrice = calcTotalPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfCartItem: cart.cartItems.length,
    data: cart,
  });
});

exports.updateQuantity = asyncHandler(async (req, res, next) => {
  const cart = await ShoppingCartModel.findOne({ user: req.user.id });
  if (!cart) {
    return next(
      new APIError(404, `There is no cart for this user = ${req.user.id}`)
    );
  }

  const productExist = cart.cartItems.find(
    (item) => item.id.toString() === req.body.cartItem.toString()
  );
  if (!productExist) {
    return next(
      new APIError(
        404,
        `There is no cart itme  with this id = ${req.body.cartItem}`
      )
    );
  }

  productExist.quantity = req.body.quantity;

  cart.totalCartPrice = calcTotalPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfCartItem: cart.cartItems.length,
    data: cart,
  });
});
exports.applyCouponToCart = asyncHandler(async (req, res, next) => {
  const coupon = await CouponModel.findOne({
    code: req.body.code,
    expire: { $gt: Date.now() },
    isActive: true,
  });
  if (!coupon) {
    return next(new APIError(404, `There is no coupon with this code`));
  }
  const percentage = coupon.discount;

  const cart = await ShoppingCartModel.findOne({ user: req.user.id });
  if (!cart) {
    return next(
      new APIError(404, `There is no cart for this user = ${req.user.id}`)
    );
  }

  cart.totalPriceAfterDiscount = cart.totalCartPrice * (1 - percentage / 100);

  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfCartItem: cart.cartItems.length,
    data: cart,
  });
});
exports.removeAllItems = asyncHandler(async (req, res, next) => {
  const cart = await ShoppingCartModel.findOneAndUpdate(
    { user: req.user.id },
    { cartItems: [] },

    { new: true }
  );
  if (!cart) {
    return next(
      new APIError(404, `There is no cart for this user = ${req.user.id}`)
    );
  }

  cart.totalCartPrice = calcTotalPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfCartItem: cart.cartItems.length,
    data: cart,
  });
});

// exports.getCoupon = asyncHandler(async (req, res, next) => {
//   try {
//     const Coupon = await CouponModel.findById(req.params.id);

//     if (!Coupon)
//       return next(
//         new APIError(404, `No  Coupon found for this id :- ${req.params.id}`)
//       );
//     res.json(Coupon);
//   } catch (e) {
//     return next(
//       new APIError(404, `No  Coupon found for this id :- ${req.params.id}`)
//     );
//   }
// });
// exports.createCoupon = asyncHandler(async (req, res, next) => {
//    const Coupon = new CouponModel({
//     ...req.body
//   });

//   const document = await Coupon.save();
//   console.log(document);

//   res.json(document);
// });

// exports.updateCoupon = asyncHandler(async (req, res, next) => {
//   try {

//     const Coupon = await CouponModel.findByIdAndUpdate(
//       req.params.id,
//       { ...req.body },

//       // to return new category: after update not before update
//       {
//         new: true,
//       }
//     );
//     if (!Coupon)
//       return next(
//         new APIError(
//           404,
//           `No  Coupon found for this id :- ${req.params.id}`
//         )
//       );
//     res.json(Coupon);
//   } catch (e) {
//     return next(
//       new APIError(404, `No  Category found for this id :- ${req.params.id}`)
//     );
//   }
// });
// exports.deleteCoupon = asyncHandler(async (req, res, next) => {
//   try {
//     const Coupon = await CouponModel.findByIdAndDelete(req.params.id);
//     if (!Coupon)
//       return next(
//         new APIError(404, `No  Coupon found for this id :- ${req.params.id}`)
//       );
//     res.json(Coupon);
//   } catch (e) {
//     return next(
//       new APIError(404, `No  Coupon found for this id :- ${req.params.id}`)
//     );
//   }
// });
