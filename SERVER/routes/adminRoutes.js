const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Approve HRs and send email (SUPERADMIN, TPO)
router.put(
  "/approve-hr/:id",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.approveHR
);

// Reject HRs and notify them (SUPERADMIN, TPO)
router.put(
  "/reject-hr/:id",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.rejectHR
);

// Bulk CSV Import (Dry Run)
router.post(
  "/students/bulk-import-dryrun",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.bulkImportDryRun
);

// Bulk CSV Import (Final Commit & Email Queue)
router.post(
  "/students/bulk-import-commit",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.bulkImportCommit
);

// Get All HRs
router.get(
  "/hr",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.getAllHRs
);

// Add HR Manually
router.post(
  "/hr/manual",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.addHRManually
);

// Add Student Manually
router.post(
  "/students/manual",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.addStudentManually
);

// Get All Students
router.get(
  "/students",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.getAllStudents
);

// Update Student
router.put(
  "/students/:id",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.updateStudent
);

// Soft Delete Student
router.put(
  "/students/:id/soft",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.softDeleteStudent
);

// Hard Delete Student
router.delete(
  "/students/:id/hard",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.hardDeleteStudent
);

// Restore Student
router.put(
  "/students/:id/restore",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.restoreStudent
);

// Toggle Lock Student
router.put(
  "/students/:id/lock",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.toggleStudentLock
);

module.exports = router;
