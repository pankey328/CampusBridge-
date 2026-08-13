const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Login /api/auth/login
router.post("/login", authController.login);

// Used for initial password set /api/auth/setup-password
router.post("/setup-password", authController.setupPassword);

// Generates OTP and sends email  /api/auth/forgot-password
router.post("/forgot-password", authController.forgotPassword);

// Reset password with otp verification /api/auth/verify-otp-and-reset
router.post("/verify-otp-and-reset", authController.verifyOtpAndReset);

// Change password with current password /api/auth/change-password
router.put("/change-password", protect, authController.changePassword);

module.exports = router;
