const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Student Routes
router.post(
  "/",
  protect,
  authorizeRoles("STUDENT"),
  complaintController.createComplaint
);

router.get(
  "/my",
  protect,
  authorizeRoles("STUDENT"),
  complaintController.getMyComplaints
);

// SuperAdmin and TPO Routes
router.get(
  "/admin/all",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  complaintController.getAllComplaints
);

router.patch(
  "/admin/:id",
  protect,
  authorizeRoles("SUPERADMIN", "TPO"),
  complaintController.updateComplaintStatus
);

module.exports = router;
