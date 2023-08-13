require("dotenv").config({ path: "./config.env" });
require("stripe")(process.env.STRIPE_SECRET);

const express = require("express");
const app = express();

const path = require("path");
app.set("view engine", "ejs"); // Set EJS as the template engine
app.set("views", path.join(__dirname, "views")); // Set the 'views' directory

const { webhookCheckout } = require("./features/order/orderService");
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
  );

app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

require("./startup/development")(app);
require("./startup/deployment")(app);
require("./startup/db")();
require("./startup/routes")(app);
require("./startup/catchingError")();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`The app is running on port ${PORT}`);
});
