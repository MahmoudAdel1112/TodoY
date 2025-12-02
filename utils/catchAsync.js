/**
 * Wraps async route handlers to automatically catch errors
 * and pass them to Express error handling middleware
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Wrapped function that catches errors
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;

