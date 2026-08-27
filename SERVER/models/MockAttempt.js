const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  question: String,
  answer: String,
  aiRating: Number,
  isFollowUp: { type: Boolean, default: false },
});

const AttemptSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  jobDriveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobDrive",
    required: true,
  },
  resumeText: String,
  questions: [QuestionSchema],
  overallRating: Number,
  evaluationReport: mongoose.Schema.Types.Mixed,
});

const MockAttempt = mongoose.model(
  "MockAttempt",
  new mongoose.Schema({
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    attempts: [AttemptSchema],
  }),
);

module.exports = MockAttempt;
