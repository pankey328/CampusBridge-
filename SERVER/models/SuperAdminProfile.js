const mongoose = require("mongoose");

const superAdminProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      default: "College Director",
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SuperAdminProfile", superAdminProfileSchema);
