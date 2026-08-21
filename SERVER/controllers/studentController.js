const JobDrive = require("../models/JobDrive");
const Application = require("../models/Application");
const StudentProfile = require("../models/StudentProfile");
const InterviewSlot = require("../models/InterviewSlot");

// Get active drives for the student 
exports.getAvailableDrives = async (req, res) => {
  try {
    const studentId = req.user.id;
    const profile = await StudentProfile.findOne({ userId: studentId });

    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const drives = await JobDrive.find({
      status: "ACTIVE",
      deadline: { $gte: new Date() }
    }).populate("companyId", "name industry").lean();

    const applications = await Application.find({ studentId });
    const appliedDriveIds = applications.map(app => app.jobDriveId.toString());

    const enrichedDrives = drives.map(drive => {
      const isApplied = appliedDriveIds.includes(drive._id.toString());
      const appRecord = applications.find(a => a.jobDriveId.toString() === drive._id.toString());
      
      // Calculate Eligibility
      let isEligible = true;
      let ineligibilityReason = "";

      if (profile.isLocked) {
        isEligible = false;
        ineligibilityReason = "Profile locked (One-Offer Policy). Contact TPO to unlock.";
      } else if (!profile.resumeUrl) {
        isEligible = false;
        ineligibilityReason = "Resume missing. Please upload your resume in Profile settings to apply.";
      } else if (profile.cgpa < drive.minCgpa) {
        isEligible = false;
        ineligibilityReason = `CGPA requirement not met (Required: ${drive.minCgpa}, Yours: ${profile.cgpa})`;
      } else if (profile.activeBacklogs > drive.maxBacklogs) {
        isEligible = false;
        ineligibilityReason = `Active backlogs limit exceeded (Max: ${drive.maxBacklogs})`;
      } else if (profile.passoutYear !== drive.passoutYear) {
        isEligible = false;
        ineligibilityReason = `Passout year mismatch (Required: ${drive.passoutYear})`;
      } else if (drive.eligibleBranches && drive.eligibleBranches.length > 0) {
        const isBranchEligible = drive.eligibleBranches.some(b => 
          b.toLowerCase() === profile.branch.toLowerCase()
        );
        if (!isBranchEligible) {
          isEligible = false;
          ineligibilityReason = `Branch not eligible`;
        }
      }

      drive.isApplied = isApplied;
      drive.applicationStatus = isApplied ? appRecord.status : null;
      drive.isEligible = isEligible;
      drive.ineligibilityReason = ineligibilityReason;

      return drive;
    });

    res.status(200).json({ message: "Available drives fetched", data: enrichedDrives });
  } catch (error) {
    console.error("Get Available Drives Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Apply to a Job Drive
exports.applyToDrive = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { jobDriveId } = req.body;

    const drive = await JobDrive.findById(jobDriveId);
    if (!drive) return res.status(404).json({ message: "Job drive not found" });

    if (drive.status !== "ACTIVE") {
      return res.status(400).json({ message: "Job drive is not active" });
    }

    if (new Date(drive.deadline) < new Date()) {
      return res.status(400).json({ message: "Application deadline has passed" });
    }

    const profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) return res.status(404).json({ message: "Student profile not found" });

    if (profile.isLocked) {
      return res.status(403).json({ message: "Your profile is locked (One-Offer Policy). You cannot apply to new drives unless unlocked by TPO." });
    }

    if (profile.cgpa < drive.minCgpa) return res.status(400).json({ message: "CGPA requirement not met" });
    if (profile.activeBacklogs > drive.maxBacklogs) return res.status(400).json({ message: "Active backlogs limit exceeded" });
    if (profile.passoutYear !== drive.passoutYear) return res.status(400).json({ message: "Passout year mismatch" });
    
    if (drive.eligibleBranches && drive.eligibleBranches.length > 0) {
      const isBranchEligible = drive.eligibleBranches.some(b => 
        b.toLowerCase() === profile.branch.toLowerCase()
      );
      if (!isBranchEligible) return res.status(400).json({ message: "Branch not eligible" });
    }

    if (!profile.resumeUrl) {
      return res.status(400).json({ message: "Please upload your resume in Profile settings before applying to job drives." });
    }

    const existingApplication = await Application.findOne({ studentId, jobDriveId });
    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied to this drive" });
    }

    const application = new Application({
      studentId,
      jobDriveId,
      status: "APPLIED"
    });

    await application.save();

    res.status(201).json({ message: "Successfully applied to the job drive", application });
  } catch (error) {
    console.error("Apply To Drive Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get My Applications
exports.getMyApplications = async (req, res) => {
  try {
    const studentId = req.user.id;

    const applications = await Application.find({ studentId })
      .populate({
        path: "jobDriveId",
        select: "title jobRole packageLPA location rounds companyId deadline",
        populate: {
          path: "companyId",
          select: "name"
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    for (let i = 0; i < applications.length; i++) {
      if (applications[i].status === 'INTERVIEW_SCHEDULED') {
        const slot = await InterviewSlot.findOne({
          studentId,
          jobDriveId: applications[i].jobDriveId._id,
          status: { $in: ["SCHEDULED", "RESCHEDULED"] }
        }).lean();
        if (slot) {
          applications[i].interviewSlot = slot;
        }
      }
    }

    res.status(200).json({ message: "Applications fetched successfully", data: applications });
  } catch (error) {
    console.error("Get My Applications Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get My Profile
exports.getProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const profile = await StudentProfile.findOne({ userId: studentId }).populate("userId", "email");
    if (!profile) return res.status(404).json({ message: "Student profile not found" });

    res.status(200).json({ message: "Profile fetched successfully", data: profile });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update My Profile
exports.updateProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { phone, linkedinUrl, githubUrl, resumeUrl, skills } = req.body;

    const profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) return res.status(404).json({ message: "Student profile not found" });

    if (phone !== undefined) profile.phone = phone;
    if (linkedinUrl !== undefined) profile.linkedinUrl = linkedinUrl;
    if (githubUrl !== undefined) profile.githubUrl = githubUrl;
    if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl;
    
    if (skills !== undefined) {
      if (typeof skills === "string") {
        profile.skills = skills.split(",").map(s => s.trim()).filter(s => s);
      } else if (Array.isArray(skills)) {
        profile.skills = skills;
      }
    }

    profile.updatedBy = studentId;
    await profile.save();

    res.status(200).json({ message: "Profile updated successfully", data: profile });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
