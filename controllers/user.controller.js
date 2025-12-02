const User = require("../schemas/user.schema");
const AppError = require("../classes/AppError");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");

exports.signup = catchAsync(async (req, res) => {
  const { email, name, password, passwordConfirm } = req.body;

  // Validate required fields
  if (!email || !name || !password || !passwordConfirm) {
    throw new AppError(
      "Please provide email, name, password, and passwordConfirm",
      400
    );
  }

  // Validate password strength
  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  // Create new user instance
  const newUser = new User({
    email,
    name,
    password,
    passwordConfirm,
  });

  // Save user to database
  // Mongoose will run validations and the pre-save hook
  // Errors are handled by the global error handler
  await newUser.save();

  // Remove password from output (security - though select: false already excludes it)
  newUser.password = undefined;
  newUser.passwordConfirm = undefined;

  // Generate JWT token
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  // Return success response
  return res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Correct order: (plainTextPassword, hashedPassword)
  const isCorrect = await user.correctPassword(password, user.password);

  if (!isCorrect) {
    throw new AppError("Invalid email or password", 401);
  }

  user.password = undefined;

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});


exports.logout = catchAsync(async (req, res) => {
  // Clear JWT token
  res.clearCookie("jwt");
  // Return success response
  return res.status(200).json({
    status: "success",
  });
});