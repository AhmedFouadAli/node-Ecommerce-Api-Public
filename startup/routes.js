const express = require("express");
const categoryRoute = require("../features/category/categoryRoute");
const subCategoryRoute = require("../features/subCategory/subcategoryRoute");
const brandRoute = require("../features/brand/brandRoute");
const productRoute = require("../features/product/productRoute");
const userRoute = require("../features/user/userRoute");
const authRoute = require("../features/auth/authRoute");
const reviewRoute = require("../features/review/reviewRoute");
const whichListRoute = require("../features/user/whichListRoute");
const addressRoute = require("../features/user/addressRoute");
const couponRouter = require("../features/coupon/couponRoute");
const shoppingCartRouter = require("../features/shoppingCart/shoppingCartRoute");
const orderRouter = require("../features/order/orderRoute");
// for handling the error
const APIError = require("../utils/apiError");
const errorMiddleWare = require("../middlewares/errorMiddleware");


module.exports = function (app) {
  app.get("/", (req, res) => {
    res.render("index");
  });
  app.use("/api/v1/category", categoryRoute);
  app.use("/api/v1/subCategory", subCategoryRoute);
  app.use("/api/v1/brand", brandRoute);
  app.use("/api/v1/product", productRoute);
  app.use("/api/v1/user", userRoute);
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/review", reviewRoute);
  app.use("/api/v1/whichList", whichListRoute);
  app.use("/api/v1/address", addressRoute);
  app.use("/api/v1/coupon", couponRouter);
  app.use("/api/v1/shoppingCart", shoppingCartRouter);
  app.use("/api/v1/order", orderRouter);

  // for catching all the route that was not define *
  app.all("*", (req, res, next) => {
    // taking error this mean it is going to sending it to the error middleware
    next(new APIError(404, `Can't find ${req.originalUrl} on this server!`));
  });
  // Global Error Handling that is going to be receive from the request :-
  app.use(errorMiddleWare);
};
