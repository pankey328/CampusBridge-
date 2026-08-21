const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Rate limit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    message: "Too many login attempts from this IP, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login /api/auth/login
router.post("/login", loginLimiter, authController.login);

// Used for initial password set /api/auth/setup-password
router.post("/setup-password", authController.setupPassword);

// Generates OTP and sends email  /api/auth/forgot-password
router.post("/forgot-password", authController.forgotPassword);

// Reset password with otp verification /api/auth/verify-otp-and-reset
router.post("/verify-otp-and-reset", authController.verifyOtpAndReset);

// Change password with current password /api/auth/change-password
router.put("/change-password", protect, authController.changePassword);

module.exports = router;
