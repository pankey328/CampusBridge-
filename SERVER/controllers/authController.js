const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Login  /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isApproved) {
      return res
        .status(403)
        .json({ message: "Your account is pending approval by the Admin." });
    }
    if (user.status === "INACTIVE") {
      return res
        .status(403)
        .json({ message: "Your account has been deactivated." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Forced Password Reset
    if (user.mustChangePassword) {
      const restrictedToken = jwt.sign(
        { id: user._id, role: "RESTRICTED" },
        process.env.JWT_SECRET,
        { expiresIn: "15m" },
      );

      return res.status(200).json({
        message: "Password reset required",
        mustChangePassword: true,
        token: restrictedToken,
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// HR activate their account by link /api/auth/setup-password
exports.setupPassword = async (req, res) => {
  try {
    const { id, token, newPassword, confirmNewPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }
    if (newPassword !== confirmNewPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (
      !user.activationTokenExpires ||
      user.activationTokenExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Activation link has expired." });
    }

    const { verifyToken } = require("../utils/cryptoUtils");
    const isValid = verifyToken(token, user.activationTokenHash);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid activation link." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.status = "ACTIVE"; 

    user.activationTokenHash = null;
    user.activationTokenExpires = null;

    await user.save();

    res
      .status(200)
      .json({ message: "Password setup successful! You can now log in." });
  } catch (error) {
    console.error("Setup Password Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Generates OTP and sends email  /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcrypt.genSalt(10);
    user.resetPasswordOtp = await bcrypt.hash(otp, salt);
    user.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    const { sendMail } = require("../utils/emailUtils");
    const emailHtml = `
      <h2>CampusBridge Password Reset</h2>
      <p>You requested a password reset. Here is your 6-digit OTP:</p>
      <h3 style="background: #f4f4f4; padding: 10px; width: fit-content; letter-spacing: 2px;">${otp}</h3>
      <p>This OTP will expire in 10 minutes.</p>
    `;
    await sendMail(email, "Your Password Reset OTP", emailHtml);

    res
      .status(200)
      .json({ message: "OTP sent to email successfully.", otp: otp });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Reset password with otp verification /api/auth/verify-otp-and-reset
exports.verifyOtpAndReset = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmNewPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }
    if (newPassword !== confirmNewPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match." });
    }

    const user = await User.findOne({ email });
    if (
      !user ||
      !user.resetPasswordOtp ||
      user.resetPasswordOtpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "OTP is invalid or has expired" });
    }

    const isValid = await bcrypt.compare(otp, user.resetPasswordOtp);
    if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return res
        .status(400)
        .json({
          message: "New password must be different from your current password.",
        });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Change password with current password /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }
    if (newPassword !== confirmNewPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match." });
    }

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect current password" });

    if (currentPassword === newPassword) {
      return res
        .status(400)
        .json({
          message: "New password must be different from your current password.",
        });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    if (user.mustChangePassword) {
      user.mustChangePassword = false;
    }
    if (user.status === "PENDING") {
      user.status = "ACTIVE";
    }
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
