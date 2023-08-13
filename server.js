const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

// for running the RESTFUL API easily
const express = require("express");
const cors = require("cors");

const app = express();

const compression = require("compression");

const morgan = require("morgan");
const dotenv = require("dotenv");
const errorMiddleWare = require("./middlewares/errorMiddleware");

const { webhookCheckout } = require("./features/order/orderService");

// Connect to DB file :-
const databaseConnection = require("./DatabaseConfig/database");

// for printing the request during the development time

// for handling the error
const APIError = require("./utils/apiError");

// for reading the .env file and storing the configration file
// reading the environment variables

dotenv.config({ path: "./config.env" });

const environmentType = process.env.NODE_ENV || "development";

databaseConnection();

// MiddleWare :- for passing the request to different layer before response

// Define a route handler for the homepage ("/")
app.get("/", (req, res) => {
  const homepageContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our E-Commerce API</title>
  <style>
    /* Reset some default styles */
    body, h1, p {
      margin: 0;
      padding: 0;
    }
    /* Body background and text color */
    body {
      background-color: #f4f4f4;
      font-family: Arial, sans-serif;
      color: #333;
    }
    /* Header styles */
    header {
      background-color: #333;
      color: #fff;
      text-align: center;
      padding: 20px;
    }
    /* Main content container */
    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    /* List of endpoints */
    .endpoint-list {
      list-style: none;
      padding: 0;
    }
    .endpoint-list li {
      margin-bottom: 10px;
      padding: 10px;
      background-color: #f9f9f9;
      border-radius: 4px;
      cursor: pointer;
    }
    /* Endpoint link styles */
    .endpoint-list li a {
      color: #333;
      text-decoration: none;
      transition: color 0.3s;
    }
    .endpoint-list li:hover {
      background-color: #e5e5e5;
    }
    /* Add some interactivity using JavaScript */
    .endpoint-list li:hover a {
      color: #007bff;
    }
  </style>
</head>
<body>
  <header>
    <h1>Welcome to Our E-Commerce API</h1>
    <p>This is the homepage of our API.</p>
  </header>
  <div class="container">
    <h2>Explore API Endpoints</h2>
    <ul class="endpoint-list">
      <li><a href="/api/v1/category">Category API</a></li>
      <li><a href="/api/v1/subCategory">Subcategory API</a></li>
      <li><a href="/api/v1/brand">Brand API</a></li>
      <li><a href="/api/v1/product">Product API</a></li>
      <!-- Add more endpoint links as needed -->
    </ul>
    <p class="bold-instruction">To explore the API services, you can use our <a href="https://elements.getpostman.com/redirect?entityId=18649674-cb9c60b8-9297-4e39-a2c1-e1ab13cb93e9&entityType=collection" target="_blank" rel="noopener noreferrer">Postman collection</a>. Before forking the collection, follow these steps:</p>
    <ol>
      <li class="bold-instruction">Fork the collection</li>
      <li class="bold-instruction">Add the following environment variable:
        <ul>
          <li><strong>URL</strong> = https://ahmedfouadalinodeecommerceapi.vercel.app</li>
        </ul>
      </li>
    </ol>
    <p class="bold-instruction">Please note that some routes require authentication:</p>
    <p>Login information for admin routes:</p>
    <pre>
{
  "email": "admin@gmail.com",
  "password": "ahmeduser"
}
    </pre>
    <p>Login information for user routes:</p>
    <pre>
{
  "email": "user@gmail.com",
  "password": "ahmeduser"
}
    </pre>
  </div>
</body>
</html>


  `;

  res.send(homepageContent);
});

// enables other domain to access the api
app.use(cors());
app.options("*", cors());

// to compress all the response
app.use(compression());
// for converting the request of body to json formate so that you can access using .

app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

app.use(express.json());

// Serving for static files that are exist in the uploads folder
app.use(express.static(path.join(__dirname, "uploads")));

if (environmentType === "development") {
  // for printing the request detail
  app.use(morgan("dev"));
  console.log("Development");
}

//routes :-

const categoryRoute = require("./features/category/categoryRoute");

app.use("/api/v1/category", categoryRoute);

const subCategoryRoute = require("./features/subCategory/subcategoryRoute");

app.use("/api/v1/subCategory", subCategoryRoute);

const brandRoute = require("./features/brand/brandRoute");

app.use("/api/v1/brand", brandRoute);

const productRoute = require("./features/product/productRoute");

app.use("/api/v1/product", productRoute);

const userRoute = require("./features/user/userRoute");

app.use("/api/v1/user", userRoute);

const authRoute = require("./features/auth/authRoute");

app.use("/api/v1/auth", authRoute);

const reviewRoute = require("./features/review/reviewRoute");

app.use("/api/v1/review", reviewRoute);

const whichListRoute = require("./features/user/whichListRoute");

app.use("/api/v1/whichList", whichListRoute);

const addressRoute = require("./features/user/addressRoute");

app.use("/api/v1/address", addressRoute);

const couponRouter = require("./features/coupon/couponRoute");

app.use("/api/v1/coupon", couponRouter);

const shoppingCartRouter = require("./features/shoppingCart/shoppingCartRoute");

app.use("/api/v1/shoppingCart", shoppingCartRouter);

const orderRouter = require("./features/order/orderRoute");

app.use("/api/v1/order", orderRouter);

// for catching all the route that was not define *
app.all("*", (req, res, next) => {
  // taking error this mean it is going to sending it to the error middleware
  next(new APIError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Global Error Handling that is going to be receive from the request :-
app.use(errorMiddleWare);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`The app is running on port ${PORT}`);
});

// for handling the unhandled rejection so any error that is going to happened outside express will call this:
// this will be call auto when detecting catch
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message, err);
  // this mean that the error is going to be handled and the application is going to be shut down
  server.close(() => {
    process.exit(1);
  });
});
