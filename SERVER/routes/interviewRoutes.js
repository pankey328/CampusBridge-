const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// INTERVIEW SCHEDULING ROUTES
router.post(
  "/job-drives/:id/schedule",
  protect,
  authorizeRoles("SUPERADMIN", "TPO", "HR"),
  interviewController.bulkScheduleInterviews
);

module.exports = router;
