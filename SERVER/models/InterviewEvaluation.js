const mongoose = require("mongoose");

const interviewEvaluationSchema = new mongoose.Schema(
  {
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSlot",
      required: true,
      unique: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    panelistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    technicalScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    softSkillScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    coreBranchScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    verdict: {
      type: String,
      enum: ["HIRED", "SHORTLISTED", "REJECTED"],
      required: true,
    },
    feedbackNotes: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewEvaluation", interviewEvaluationSchema);
