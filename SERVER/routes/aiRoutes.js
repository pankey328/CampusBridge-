const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/transcribe", protect, authorizeRoles("STUDENT"), aiController.transcribeAudio);

module.exports = router;
