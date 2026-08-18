const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// View Available Drives (STUDENT)
router.get(
  "/drives",
  protect,
  authorizeRoles("STUDENT"),
  studentController.getAvailableDrives
);

// Apply to a Job Drive (STUDENT)
router.post(
  "/drives/apply",
  protect,
  authorizeRoles("STUDENT"),
  studentController.applyToDrive
);

// View My Applications (STUDENT)
router.get(
  "/applications",
  protect,
  authorizeRoles("STUDENT"),
  studentController.getMyApplications
);

// Get Student Profile (STUDENT)
router.get(
  "/profile",
  protect,
  authorizeRoles("STUDENT"),
  studentController.getProfile
);

// Update Student Profile (Personal Details) (STUDENT)
router.put(
  "/profile",
  protect,
  authorizeRoles("STUDENT"),
  studentController.updateProfile
);

module.exports = router;
