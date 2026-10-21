const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ==========================================
// INTERVIEW SCHEDULING ROUTES
// ==========================================

// @route   POST /api/interviews/job-drives/:id/schedule
// @desc    Bulk schedule interviews for a job drive
// @access  Protected (SUPERADMIN, TPO, HR)
router.post(
  "/job-drives/:id/schedule",
  protect,
  authorizeRoles("SUPERADMIN", "TPO", "HR"),
  interviewController.bulkScheduleInterviews
);

module.exports = router;
