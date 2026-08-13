const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    activeBacklogs: {
      type: Number,
      default: 0,
      min: 0,
    },
    passoutYear: {
      type: Number,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
