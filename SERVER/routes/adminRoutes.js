const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const jobDriveController = require("../controllers/jobDriveController");
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

// Bulk CSV Import (Final Commit & Email)
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

// Get HR By Id
router.get(
  "/hr/:id",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.getHRById
);

// Add HR Manually
router.post(
  "/hr/manual",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.addHRManually
);

// Update HR
router.put(
  "/hr/:id",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.updateHR
);

// Soft Delete HR
router.put(
  "/hr/:id/soft",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.softDeleteHR
);

// Hard Delete HR
router.delete(
  "/hr/:id/hard",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.hardDeleteHR
);

// Restore HR
router.put(
  "/hr/:id/restore",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.restoreHR
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

// Get Student By Id
router.get(
  "/students/:id",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.getStudentById
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

// Job Drive Routes
router.post(
  "/job-drives",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  jobDriveController.createJobDrive
);

router.get(
  "/job-drives",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  jobDriveController.getAllJobDrives
);

router.get(
  "/job-drives/:id",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  jobDriveController.getJobDriveById
);

router.put(
  "/job-drives/:id",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  jobDriveController.updateJobDrive
);

router.delete(
  "/job-drives/:id",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  jobDriveController.deleteJobDrive
);

router.put(
  "/job-drives/:id/complete",
  protect,
  authorizeRoles("SUPERADMIN", "TPO", "HR"),
  jobDriveController.completeJobDrive
);

// Application Tracking Routes
router.get(
  "/job-drives/:id/applications",
  protect,
  authorizeRoles("SUPERADMIN", "TPO", "HR"),
  jobDriveController.getDriveApplications
);

router.put(
  "/applications/bulk",
  protect,
  authorizeRoles("SUPERADMIN", "TPO", "HR"),
  jobDriveController.bulkUpdateApplicationStatus
);

router.put(
  "/applications/:applicationId/status",
  protect,
  authorizeRoles("SUPERADMIN", "TPO", "HR"),
  jobDriveController.updateApplicationStatus
);

// Notifications & Resend
router.get(
  "/notifications",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.getNotificationLogs
);

router.post(
  "/notifications/:id/resend",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.resendNotification
);

// HR specific resend activation link
router.post(
  "/hr/:id/resend-activation",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  adminController.resendHRActivation
);

module.exports = router;
