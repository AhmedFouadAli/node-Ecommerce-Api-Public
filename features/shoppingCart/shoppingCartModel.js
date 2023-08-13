const mongoose = require("mongoose");
// 1- create a schema
const shoppingCartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        color: {
          type: String,
        },
        quantity: {
          type: Number,
          default: 1,

        },
        price: {
          type: Number,
          required: [true, "price is required"],
        }
      }
    ],
    totalCartPrice: Number,
    totalPriceAfterDiscount: Number,
    user: {
      type: mongoose.Schema.ObjectId,
        ref:"user"
    }


  },
  { timestamps: true }
);
const shoppingCartModel = mongoose.model("ShoppingCart", shoppingCartSchema);

module.exports = shoppingCartModel;
