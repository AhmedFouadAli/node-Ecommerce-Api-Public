const asyncHandler = require("express-async-handler");
const APIError = require("../../utils/apiError");
const UserModel = require("../user/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmailTo = require("../../utils/sendEmail");

exports.signUp = asyncHandler(async (req, res, next) => {
  // Create the user object
  const user = await UserModel.create(req.body);
  // Generate token
  const token = jwt.sign({ userId: user.id }, process.env.JWE_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(201).json({ status: "success", token: token, data: user });
});

exports.signIn = asyncHandler(async (req, res, next) => {
  // Create the user object
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new APIError(404, `Incorrect email or password`));
  }
  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) {
    return next(new APIError(404, `Incorrect email or password`));
  }

  // Generate token
  const token = jwt.sign({ userId: user.id }, process.env.JWE_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(201).json({ status: "success", token: token, data: user });
});

exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token || token===null) {
    return next(
      new APIError(401, `You are not logged in! Please log in to get access.`)
    );
  }

  // 2) Verification token
  const decoded = jwt.verify(token, process.env.JWE_SECRET_KEY);
  /* two error can happened:
   if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();
    if (err.name === "TokenExpiredError") err = handleJwtExpired();
    */

  // 3) Check if user still exists
  const currentUser = await UserModel.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new APIError(
        401,
        `The user belonging to this token does no longer exist.`
      )
    );
  }

  // 4) Check if user haveCorrect password

  if (currentUser.passwordChangedAt) {
    const changedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (decoded.iat < changedTimestamp) {
      return next(
        new APIError(
          401,
          `User recently changed password! Please log in again.`
        )
      );
    }
  }

  req.user = currentUser;
  next();
});

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email: email });
  if (!user) {
    return next(
      new APIError(404, `There is no user with email address. ${email}`)
    );
  }
  // 2) Generate the random 6 number
  const randomKey = Math.floor(100000 + Math.random() * 900000).toString();
  // 3) Hash the random number and save to database
  const hashedRandomKey = await bcrypt.hash(randomKey, 12);
  user.passwordResetCode = hashedRandomKey;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordVerify = false;
  await user.save({
    validateBeforeSave: false,
  });
  // 4) Send it to user's email

  try {
    await sendEmailTo({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message: `Your password reset code is ${randomKey}. Valid for 10 min`,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordVerify = undefined;
    await user.save({
      validateBeforeSave: false,
    });
    return next(new APIError(500, `There is an error in sending email`));
  }
  res.status(200).json({
    status: "success",
    message: `Code sent to email! : ${user.email}`,
  });
});

exports.verifyRestCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email: email });
  if (!user) {
    return next(
      new APIError(404, `There is no user with email address. ${email}`)
    );
  }
  const { code } = req.body;
  const isMatch = await bcrypt.compare(code, user.passwordResetCode);
  const isValid = Date.now() < user.passwordResetExpires.getTime();
  console.log(
    `validation time left is  ${
      Math.abs(Date.now() - user.passwordResetExpires.getTime()) / (1000 * 60)
    } minutes`
  );

  if (user.passwordVerify) {
    return next(
      new APIError(404, `You already verified your password, please login`)
    );
  }
  if (!isValid) {
    return next(new APIError(404, `Code is expired`));
  }

  if (!isMatch) {
    return next(new APIError(404, `Incorrect code`));
  }
  user.passwordVerify = true;
  await user.save({
    validateBeforeSave: false,
  });
  res.status(200).json({
    status: "success",
    message: `Code is correct`,
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body;
  const user = await UserModel.findOne(
    { email: email }
    // {
    //   password: await bcrypt.hash(newPassword, 12),
    // }
  );
  if (!user) {
    return next(
      new APIError(404, `There is no user with email address. ${email}`)
    );
  }
  if (!user.passwordVerify) {
    return next(new APIError(404, `You did not verify your code `));
  }
  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordVerify = undefined;
  await user.save({
    validateBeforeSave: false,
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWE_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(201).json({ status: "success", token: token, data: user });
});

exports.allowTo =
  (...roles) =>
  async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new APIError(403, `You do not have permission to perform this action`)
      );
    }
    next();
  };
