const asyncHandler = require("express-async-handler");
const OrderModel = require("./orderModel");
const ShoppingCartModel = require("../shoppingCart/shoppingCartModel");
const ProductModel = require("../product/productModel");
const UserModel = require("../user/userModel");

const APIError = require("../../utils/apiError");

const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const taxPrice = 15;
  const shippingPrice = 15;

  const { shoppingCartId } = req.body;
  const shoppingCart = await ShoppingCartModel.findById(shoppingCartId);
  if (!shoppingCart) {
    return next(
      new APIError(
        404,
        `There is no shopping cart with this id ${shoppingCartId}`
      )
    );
  }
  const cartPrice = shoppingCart.totalPriceAfterDiscount
    ? shoppingCart.totalPriceAfterDiscount
    : shoppingCart.totalCartPrice;

  let totallPrice = cartPrice + cartPrice * (taxPrice / 100);
  totallPrice += cartPrice * (shippingPrice / 100);

  const order = await OrderModel.create({
    user: req.user.id,
    items: shoppingCart.cartItems,
    totalPrice: totallPrice,
    taxPrice: taxPrice,
    shippingPrice: shippingPrice,
    paymentType: "cash",

    shippingAddress: req.body.shippingAddress,
  });
  if (order) {
    // to do many operation in one command
    const bulkOptions = shoppingCart.cartItems.map((item) => ({
      updateOne: {
        filter: {
          _id: item.product,
        },
        update: {
          $inc: {
            sold: item.quantity,
          },
        },
      },
    }));

    await ProductModel.bulkWrite(bulkOptions, {});

    await ShoppingCartModel.findByIdAndDelete(shoppingCartId);
  } else {
    return next(new APIError(400, "Invalid order data"));
  }
  res.json({
    status: "success",
    data: order,
  });
});

exports.getOrders = asyncHandler(async (req, res) => {
  const order = await OrderModel.find({ user: req.user.id });
  res.json({
    status: "success",

    data: order,
  });
});
exports.updateOrderState = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findByIdAndUpdate(
    req.params.orderId,
    {
      ...req.body,
    },
    {
      new: true,
    }
  );

  if (!order) {
    return next(new APIError(400, "Invalid order data"));
  }
  res.json({
    status: "success",
    data: order,
  });
});
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.orderId);
  if (!order) {
    return next(
      new APIError(404, `No order found for this id ${req.params.id}`)
    );
  }
  res.json({
    status: "success",
    data: order,
  });
});

exports.checkOut = asyncHandler(async (req, res, next) => {
  const taxPrice = 15;
  const shippingPrice = 15;
  const { shoppingCartId } = req.params;
  const shoppingCart = await ShoppingCartModel.findById(shoppingCartId);
  if (!shoppingCart) {
    return next(
      new APIError(
        404,
        `There is no shopping cart with this id ${shoppingCartId}`
      )
    );
  }
  const cartPrice = shoppingCart.totalPriceAfterDiscount
    ? shoppingCart.totalPriceAfterDiscount
    : shoppingCart.totalCartPrice;

  let totallPrice = cartPrice + cartPrice * (taxPrice / 100);
  totallPrice += cartPrice * (shippingPrice / 100);
  const product = await stripe.products.create({
    name: req.user.name, // Replace with the actual product name
  });
  const price = await stripe.prices.create({
    unit_amount: Math.round(totallPrice * 100), // Amount in the smallest currency unit (e.g., cents)
    product: product.id,

    currency: "SAR",
  });

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/order`,
    cancel_url: `${req.protocol}://${req.get("host")}/shoppingCart`,
    customer_email: req.user.email,
    client_reference_id: shoppingCartId,
    metadata: req.body.shippingAddress,
  });

  res.json({
    status: "success",
    data: session,
  });
});

const createOrder = async (session) => {
  const shoppingCartId = session.client_reference_id;
  const address = session.metadata;
  const paymentTotall = session.amount_total / 100;

  const shoppingCart = await ShoppingCartModel.findById(shoppingCartId);
  const user = await UserModel.findOne({
    email: session.customer_email,
  });

  const order = await OrderModel.create({
    user: user.id,
    items: shoppingCart.cartItems,
    totalPrice: paymentTotall,

    paymentType: "card",
    shippingAddress: address,
    isPaid: true,
    paiedAt: Date.now(),
  });
  if (order) {
    // to do many operation in one command
    const bulkOptions = shoppingCart.cartItems.map((item) => ({
      updateOne: {
        filter: {
          _id: item.product,
        },
        update: {
          $inc: {
            sold: item.quantity,
          },
        },
      },
    }));

    await ProductModel.bulkWrite(bulkOptions, {});

    await ShoppingCartModel.findByIdAndDelete(shoppingCartId);
  }
};

exports.webhookCheckout = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  console.log(`req.body ${req.body}`);
  console.log(`sig ${sig}`);
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOCK_SECRETE
    );
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);

    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      createOrder(event.data.object);

      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send(200).json({
    status: "success",
    received: true,
  });
});
