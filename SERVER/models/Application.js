const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobDriveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobDrive",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "APPLIED",
        "SHORTLISTED",
        "INTERVIEW_SCHEDULED",
        "HIRED",
        "REJECTED",
        "WITHDRAWN",
      ],
      default: "APPLIED",
    },

    reassignedFromDriveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobDrive",
      default: null,
    },
    reassignedByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

applicationSchema.index({ jobDriveId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
