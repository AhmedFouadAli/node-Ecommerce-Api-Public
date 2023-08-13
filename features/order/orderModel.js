const mongoose = require("mongoose");
// 1- create a schema
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      require: [true, "The order must belong to user"],
    },
    items: [
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
    shippingAddress: {
      details: String,
      city: String,
      phone: String,
      postalCode: String,
    },
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
    },
    paymentType: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isPaidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deleverAt: {
      type: Date,
    },
  },
  { timestamps: true }
);
orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email",
  }).populate({
    path: "items.product",
    select: "title imageCover price",
  });
  next();
})

const orderModel = mongoose.model("Order", orderSchema);

module.exports = orderModel;
