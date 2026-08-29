const mongoose = require("mongoose");

const interviewSlotSchema = new mongoose.Schema(
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
    mode: {
      type: String,
      enum: ["ON_CAMPUS", "ONLINE"],
      required: true,
    },

    // for On-Campus
    venueBuilding: { type: String, trim: true },
    venueRoom: { type: String, trim: true },

    // for Online
    meetingLink: { type: String, trim: true },
    backupPhone: { type: String, trim: true },

    slotDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["SCHEDULED", "RESCHEDULED", "CANCELLED", "COMPLETED", "ABSENT"],
      default: "SCHEDULED",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("InterviewSlot", interviewSlotSchema);
