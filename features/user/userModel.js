const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

// 1- create a schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "user name is require !!!"],
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: [true, "user email is required !!!"],
      required: [true, "user name is require !!!"],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "user password is require !!!"],
      minlength: [6, "password is too short"],
      maxlength: [50, "password is too long"],
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now(),
    },
    passwordResetCode: String,
    passwordResetExpires: {
      type: Date,
    },
    passwordVerify: {
      type: Boolean,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    phone: String,

    profileImg: String,

    // child refrence since in the max the user will store 100
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",

      }
    ],
    address: [
      {
        id: {type:mongoose.Schema.Types.ObjectId},
        alias: String,
        detail: String,
        city: String,
        postalCode: String,
        phone:String



      }
    ]
    // This one example for embedded document
    // addreses:[{title:String,postalCode:Number}],
  },
  //this will create two thing for you created at , updated at
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  console.log(this);
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const updateImageUrlPath = (doc) => {
  //update the image to sending it to the api with full url

  if (doc.profileImg) {
    doc.profileImg = `${process.env.BASE_RUL || process.env.VERCEL_URL}/users/${
      doc.profileImg
    }`;
  }
  console.log("this fired after a document was saved");
};
userSchema.post("init", updateImageUrlPath);
userSchema.post("save", updateImageUrlPath);

// 2- create a model
const userModel = mongoose.model("user", userSchema);

// 3- export the model
module.exports = userModel;
