const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Create SuperAdmin /api/superadmin/seed
router.post("/seed", superAdminController.seedSuperAdmin);

router.post(
  "/tpos",
  protect,
  authorizeRoles("SUPERADMIN"),
  superAdminController.createTPO
);

router.get(
  "/tpos",
  protect,
  authorizeRoles("SUPERADMIN"),
  superAdminController.getAllTPOs
);

router.get(
  "/tpos/:id",
  protect,
  authorizeRoles("SUPERADMIN"),
  superAdminController.getTPOById
);

router.put(
  "/tpos/:id",
  protect,
  authorizeRoles("SUPERADMIN"),
  superAdminController.updateTPO
);

router.put(
  "/tpos/:id/toggle-status",
  protect,
  authorizeRoles("SUPERADMIN"),
  superAdminController.toggleTPOStatus
);

module.exports = router;
