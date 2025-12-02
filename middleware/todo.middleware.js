const AppError = require("../classes/AppError");

exports.checkBody = (req, res, next) => {
  const { title, date } = req.body || {};

  // Basic validation for presence and simple type checks
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return next(new AppError("Todo must have a non-empty 'title' string.", 400));
  }

  // ✅ if validation passes, go to the controller
  next();
};

