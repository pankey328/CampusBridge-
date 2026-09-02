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
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin: 0; padding: 0; background-color: #F9F7F1; font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9F7F1; padding: 30px 12px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                <tr>
                  <td style="background-color: #B6F596; padding: 24px 32px; border-bottom: 1px solid rgba(3, 77, 53, 0.1);">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <span style="font-size: 24px; font-weight: 800; color: #034D35; letter-spacing: -1px;">CampusBridge</span>
                        </td>
                        <td align="right">
                          <span style="background-color: rgba(3, 77, 53, 0.12); color: #034D35; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">Security</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px 32px 28px 32px;">
                    <h2 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #121212;">Password Reset OTP</h2>
                    <p style="margin: 0 0 20px 0; font-size: 15px; color: #4B5563; line-height: 1.6;">
                      You requested a password reset for your CampusBridge account. Use the one-time verification code below to set a new password:
                    </p>
                    <div style="text-align: center; margin: 28px 0;">
                      <div style="display: inline-block; background-color: #F0FDF4; border: 2px dashed #049669; border-radius: 14px; padding: 16px 36px;">
                        <span style="font-family: monospace, 'Plus Jakarta Sans', sans-serif; font-size: 34px; font-weight: 800; color: #034D35; letter-spacing: 8px;">${otp}</span>
                      </div>
                    </div>
                    <p style="margin: 0; font-size: 13px; color: #6B7280; text-align: center;">
                      This code is valid for <strong>10 minutes</strong>. If you did not request this reset, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #FAFAF9; padding: 20px 32px; border-top: 1px solid #F3F4F6; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #9CA3AF; line-height: 1.5;">
                      CampusBridge &bull; Placement Operating System<br>
                      Bridging corporate hiring with student potential.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
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
