const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../schemas/user.schema");
const AppError = require("../classes/AppError");
const catchAsync = require("../utils/catchAsync");

// Promisify jwt.verify to use async/await syntax
const verifyToken = promisify(jwt.verify);

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    throw new AppError("You are not logged in. Please log in to get access.", 401);
  }
  
  // Verify token
  let decoded;
  try {
    decoded = await verifyToken(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError("Invalid token. Please log in again.", 401);
  }
  
  req.user = await User.findById(decoded.id);
  if (!req.user) {
    throw new AppError("The user belonging to this token does no longer exist.", 401);
  }
  next();
});

