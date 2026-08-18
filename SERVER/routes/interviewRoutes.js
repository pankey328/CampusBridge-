const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Bulk schedule interviews for a job drive (SUPERADMIN, TPO, HR)
router.post(
  "/job-drives/:id/schedule",
  protect,
  authorizeRoles("SUPERADMIN", "TPO", "HR"),
  interviewController.bulkScheduleInterviews,
);

module.exports = router;
