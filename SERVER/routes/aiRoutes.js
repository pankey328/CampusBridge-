const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/start", protect, authorizeRoles("STUDENT"), aiController.startPracticeSession);
router.post("/submit", protect, authorizeRoles("STUDENT"), aiController.submitAnswer);
router.post("/transcribe", protect, authorizeRoles("STUDENT"), aiController.transcribeAudio);

module.exports = router;
