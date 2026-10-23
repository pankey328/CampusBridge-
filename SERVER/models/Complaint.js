const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    studentProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
    },
    complaintType: {
      type: String,
      required: [true, "Complaint type is required"],
      enum: [
        "Interview Scheduling",
        "Placement Drive & Eligibility",
        "Technical & Platform Issue",
        "Document & Profile Verification",
        "General / Policy Query",
      ],
      index: true,
    },
    priority: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "Medium",
      index: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 3000,
    },
    aiEvaluation: {
      urgency: {
        type: String,
        enum: ["Critical", "High", "Medium", "Low"],
        default: "Medium",
      },
      sentiment: {
        type: String,
        default: "Neutral",
      },
      aiReply: {
        type: String,
        required: true,
      },
      executiveSummary: {
        type: String,
        default: "",
      },
      suggestedAction: {
        type: String,
        default: "",
      },
    },
    status: {
      type: String,
      enum: ["Open", "AI-Resolved", "Under Review", "Escalated", "Closed"],
      default: "AI-Resolved",
      index: true,
    },
    adminNotes: {
      type: String,
      default: "",
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
