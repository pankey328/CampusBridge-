const mongoose = require("mongoose");

const jobDriveSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    postedByHR: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    jobRole: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    
    eligibleBranches: {
      type: [String], 
      required: true, 
    },
    minCgpa: {
      type: Number,
      default: 0,
    },
    maxBacklogs: {
      type: Number,
      default: 0,
    },
    passoutYear: {
      type: Number,
      required: true,
    },
    
    packageLPA: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    driveDate: {
      type: Date,
    },
    deadline: {
      type: Date,
      required: true,
    },
    
    status: {
      type: String,
      enum: ["DRAFT", "PENDING_APPROVAL", "ACTIVE", "COMPLETED", "CANCELLED"],
      default: "PENDING_APPROVAL", 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobDrive", jobDriveSchema);
