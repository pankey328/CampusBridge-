const JobDrive = require("../models/JobDrive");
const Company = require("../models/Company");
const User = require("../models/User");

// Create Job Drive
exports.createJobDrive = async (req, res) => {
  try {
    const {
      companyId,
      postedByHR,
      title,
      jobRole,
      description,
      eligibleBranches,
      minCgpa,
      maxBacklogs,
      passoutYear,
      packageLPA,
      location,
      driveDate,
      deadline,
      status,
      rounds,
    } = req.body;

    const newJobDrive = new JobDrive({
      companyId,
      postedByHR,
      title,
      jobRole,
      description,
      eligibleBranches,
      minCgpa,
      maxBacklogs,
      passoutYear,
      packageLPA,
      location,
      driveDate,
      deadline,
      status: status || "DRAFT",
      rounds: rounds || [],
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    await newJobDrive.save();
    res.status(201).json({ message: "Job drive created successfully", jobDrive: newJobDrive });
  } catch (error) {
    console.error("Create Job Drive Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get All Job Drives
exports.getAllJobDrives = async (req, res) => {
  try {
    const jobDrives = await JobDrive.find()
      .populate("companyId", "name")
      .populate("postedByHR", "email")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "Job drives fetched successfully", data: jobDrives });
  } catch (error) {
    console.error("Get All Job Drives Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get Job Drive By Id
exports.getJobDriveById = async (req, res) => {
  try {
    const jobDrive = await JobDrive.findById(req.params.id)
      .populate("companyId", "name industry")
      .populate("postedByHR", "email")
      .populate("createdBy", "email role")
      .populate("updatedBy", "email role");

    if (!jobDrive) {
      return res.status(404).json({ message: "Job drive not found" });
    }

    res.status(200).json({ message: "Job drive fetched successfully", data: jobDrive });
  } catch (error) {
    console.error("Get Job Drive By Id Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update Job Drive
exports.updateJobDrive = async (req, res) => {
  try {
    const jobDrive = await JobDrive.findById(req.params.id);
    if (!jobDrive) return res.status(404).json({ message: "Job drive not found" });

    Object.assign(jobDrive, req.body);
    jobDrive.updatedBy = req.user.id;

    await jobDrive.save();
    res.status(200).json({ message: "Job drive updated successfully", jobDrive });
  } catch (error) {
    console.error("Update Job Drive Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete Job Drive
exports.deleteJobDrive = async (req, res) => {
  try {
    const jobDrive = await JobDrive.findByIdAndDelete(req.params.id);
    if (!jobDrive) return res.status(404).json({ message: "Job drive not found" });

    res.status(200).json({ message: "Job drive deleted successfully" });
  } catch (error) {
    console.error("Delete Job Drive Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
