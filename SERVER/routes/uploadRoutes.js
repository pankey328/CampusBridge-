const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { uploadResume, uploadLogo, uploadJD } = require("../utils/cloudinaryUtils");

// Upload Resume (STUDENT only)
router.post("/resume", protect, authorizeRoles("STUDENT"), async (req, res) => {
  try {
    if (!req.files || !req.files.resume) {
      return res.status(400).json({ message: "No resume file uploaded." });
    }

    const file = req.files.resume;
    const secureUrl = await uploadResume(file);

    res.status(200).json({
      message: "Resume uploaded successfully to Cloudinary.",
      url: secureUrl
    });
  } catch (error) {
    console.error("Resume Upload Error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Upload Logo (HR, ADMIN, SUPERADMIN, TPO)
router.post("/logo", protect, authorizeRoles("HR", "ADMIN", "SUPERADMIN", "TPO"), async (req, res) => {
  try {
    if (!req.files || !req.files.logo) {
      return res.status(400).json({ message: "No logo file uploaded." });
    }

    const file = req.files.logo;
    const secureUrl = await uploadLogo(file);

    res.status(200).json({
      message: "Company logo uploaded successfully to Cloudinary.",
      url: secureUrl
    });
  } catch (error) {
    console.error("Logo Upload Error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Upload Job Description Document (HR, ADMIN, SUPERADMIN, TPO)
router.post("/jd", protect, authorizeRoles("HR", "ADMIN", "SUPERADMIN", "TPO"), async (req, res) => {
  try {
    if (!req.files || !req.files.jd) {
      return res.status(400).json({ message: "No JD file uploaded." });
    }

    const file = req.files.jd;
    const secureUrl = await uploadJD(file);

    res.status(200).json({
      message: "Job description uploaded successfully to Cloudinary.",
      url: secureUrl
    });
  } catch (error) {
    console.error("JD Upload Error:", error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
