const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const UserModel = require("./userModel");
const APIError = require("../../utils/apiError");

const jwt = require("jsonwebtoken");

const {
  uploadSingleImage,
} = require("../../middlewares/uploadImageMiddleware");

const sharp = require("sharp");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    // this is to make the name of the image unique
    const uniqueSuffix = `user-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${uniqueSuffix}`);

    req.body.profileImg = uniqueSuffix;
  }
  console.log(req.body);
  next();
});

exports.uploadUserImage = uploadSingleImage("users", "profileImg");

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await UserModel.find();

  res.json({
    result: users.length,
    data: users,
  });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user)
      return next(
        new APIError(404, `No user found for this id :- ${req.params.id}`)
      );
    res.json(user);
  } catch (e) {
    return next(
      new APIError(404, `error - No user found for this id :- ${req.params.id}`)
    );
  }
});
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = new UserModel({
    ...req.body,
    slug: slugify(req.body.name),
  });

  const document = await user.save();

  res.json(document);
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    if (req.body.password) {
      delete req.body.password;
    }

    const User = await UserModel.findByIdAndUpdate(
      req.params.id,
      { ...req.body },

      {
        new: true,
      }
    );
    if (!User) {
      return next(
        new APIError(404, `No User found for this id :- ${req.params.id}`)
      );
    }
    res.json(User);
  } catch (e) {
    return next(
      new APIError(404, `error No User found for this id :- ${req.params.id}`)
    );
  }
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.newPassword, 12);
    }

    const User = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        password: req.body.password,
        passwordChangedAt: Date.now(),
      },

      {
        new: true,
      }
    );
    if (!User) {
      return next(
        new APIError(404, `No User found for this id :- ${req.params.id}`)
      );
    }
    res.json(User);
  } catch (e) {
    return next(
      new APIError(404, `error No User found for this id :- ${req.params.id}`)
    );
  }
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user)
      return next(
        new APIError(404, `No user found for this id :- ${req.params.id}`)
      );
    res.json(user);
  } catch (e) {
    return next(
      new APIError(404, `error No user found for this id :- ${req.params.id}`)
    );
  }
});

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      {
        password: await bcrypt.hash(req.body.newPassword, 12),
        passwordChangedAt: Date.now(),
      },

      {
        new: true,
      }
    );
    if (!user) {
      return next(
        new APIError(404, `No User found for this id :- ${req.user.id}`)
      );
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWE_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.json(200, { user, token });
  } catch (e) {
    return next(
      new APIError(404, `error No User found for this id :- ${req.user.id}`)
    );
  }
});

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    if (req.body.password) {
      delete req.body.password;
    }

    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name ? req.body.name : req.user.name,
        email: req.body.email ? req.body.email : req.user.email,
        slug: req.body.slug ? req.body.slug : req.user.slug,
        phone: req.body.phone ? req.body.phone : req.user.phone,
      },

      {
        new: true,
      }
    );
    if (!user) {
      return next(
        new APIError(404, `No User found for this id :- ${req.user.id}`)
      );
    }

    res.json(200, { user });
  } catch (e) {
    return next(
      new APIError(404, `error No User found for this id :- ${req.user.id}`)
    );
  }
});
