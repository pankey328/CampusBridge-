const express = require("express");
const router = express.Router();
const hrController = require("../controllers/hrController");
const jobDriveController = require("../controllers/jobDriveController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// HR Registration /api/hr/register
router.post("/register", hrController.registerHR);

router.use(protect);
router.use(authorizeRoles("HR"));
// HR Profile
router.get("/profile", hrController.getHRProfile);
router.put("/profile", hrController.updateHRProfile);

// HR Dashboard
router.get("/dashboard", hrController.getDashboardOverview);

// HR Job Drives
router.get("/job-drives", jobDriveController.getHRJobDrives);
router.get("/job-drives/:id", jobDriveController.getJobDriveById);
router.post("/job-drives", jobDriveController.createJobDrive);
router.put("/job-drives/:id", jobDriveController.updateJobDrive);
router.put("/job-drives/:id/complete", jobDriveController.completeJobDrive);
router.delete("/job-drives/:id", jobDriveController.deleteJobDrive);

// HR ATS (Application Tracking)
router.get("/job-drives/:id/applications", jobDriveController.getDriveApplications);
router.put("/applications/bulk", jobDriveController.bulkUpdateApplicationStatus);
router.put("/applications/:applicationId/status", jobDriveController.updateApplicationStatus);


module.exports = router;
