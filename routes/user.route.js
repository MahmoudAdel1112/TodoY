const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const userController = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

// Stricter rate limiter for auth endpoints (login/signup protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message:
    "Too many login attempts from this IP, please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

router.route("/signup").post(authLimiter, userController.signup);
router.route("/login").post(authLimiter, userController.login);
router.route("/logout").post(userController.logout);
router.route("/me").get(protect, userController.getMe);

module.exports = router;
