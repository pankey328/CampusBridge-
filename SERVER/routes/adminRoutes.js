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

module.exports = router;
