const express = require("express");
const router = express.Router();
const { seedSuperAdmin } = require("../controllers/superAdminController");

// Create SuperAdmin /api/superadmin/seed
router.post("/seed", seedSuperAdmin);

module.exports = router;
