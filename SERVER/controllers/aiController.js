const StudentProfile = require("../models/StudentProfile");
const aiService = require("../utils/aiService");

// Start a new practice interview session
exports.startPracticeSession = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found. Please complete your profile first." });
    }

    const skills = student.skills || [];
    const branch = student.branch || "";

    const questions = await aiService.generateQuestionsBatch(skills, branch, 3);

    res.status(200).json({
      questions,
      skills,
      branch
    });
  } catch (error) {
    console.error("Start Practice Session Error:", error);
    res.status(500).json({ message: error.message || "Failed to start AI practice session." });
  }
};

// Submit answers and get evaluation scorecard
exports.submitAnswer = async (req, res) => {
  try {
    const { chatHistory } = req.body;

    if (!chatHistory || !Array.isArray(chatHistory) || chatHistory.length === 0) {
      return res.status(400).json({ message: "Chat transcript history is required." });
    }

    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    const skills = student.skills || [];
    const branch = student.branch || "";

    const evaluation = await aiService.evaluateInterview(skills, branch, chatHistory);

    res.status(200).json({
      chatHistory,
      evaluation,
      isComplete: true
    });
  } catch (error) {
    console.error("Submit Answer Error:", error);
    res.status(500).json({ message: error.message || "Failed to process interview response." });
  }
};

// Transcribe audio
exports.transcribeAudio = async (req, res) => {
  try {
    if (!req.files || !req.files.audio) {
      return res.status(400).json({ message: "No audio file uploaded." });
    }

    const audioFile = req.files.audio;
    const transcript = await aiService.transcribeAudio(audioFile.data, audioFile.mimetype);

    res.status(200).json({ text: transcript });
  } catch (error) {
    console.error("Audio Transcription Controller Error:", error);
    res.status(500).json({ message: error.message || "Failed to transcribe audio." });
  }
};
