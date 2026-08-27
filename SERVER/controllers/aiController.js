const aiService = require("../utils/aiService");

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
