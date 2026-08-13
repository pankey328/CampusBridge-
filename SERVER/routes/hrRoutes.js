const express = require("express");
const router = express.Router();
const hrController = require("../controllers/hrController");

// HR Registration /api/hr/register
router.post("/register", hrController.registerHR);

module.exports = router;
