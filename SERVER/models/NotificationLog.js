const mongoose = require("mongoose");

const notificationLogSchema = new mongoose.Schema(
  {
    recipientEmail: {
      type: String,
      required: true,
      trim: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subject: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["WELCOME", "HR_ACTIVATION", "INTERVIEW_SCHEDULED", "REASSIGNED", "INTERVIEW_CANCELLED", "GENERAL"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "DELIVERED", "FAILED"],
      default: "PENDING",
    },

    attempts: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: "", 
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotificationLog", notificationLogSchema);
