const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["SUPERADMIN", "TPO", "HR", "STUDENT", "PANELIST"],
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "PENDING", "INACTIVE"],
      default: "PENDING",
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    activationTokenHash: {
      type: String,
      default: null,
    },
    activationTokenExpires: {
      type: Date,
      default: null,
    },
    resetPasswordOtp: {
      type: String,
      default: null,
    },
    resetPasswordOtpExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
