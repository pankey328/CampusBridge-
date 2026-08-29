const User = require("../models/User");
const HRProfile = require("../models/HRProfile");
const Company = require("../models/Company");
const JobDrive = require("../models/JobDrive");
const Application = require("../models/Application");
const StudentProfile = require("../models/StudentProfile");

// HR register
exports.registerHR = async (req, res) => {
  try {
    const { email, companyName, designation, phone, linkedinUrl, gstin, website, industry } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    let company = await Company.findOne({ name: companyName });
    if (!company) {
      // Create Company
      company = new Company({
        name: companyName,
        website,
        industry,
        gstin,
        isApproved: false,
      });
      await company.save();
    }

    // Create User
    const newUser = new User({
      email,
      password: "PENDING_SETUP",
      role: "HR",
      isApproved: false,
      status: "PENDING",
    });
    const savedUser = await newUser.save();

    // Create HR Profile
    const newProfile = new HRProfile({
      userId: savedUser._id,
      companyName: company.name,
      designation,
      phone,
      linkedinUrl,
    });
    await newProfile.save();

    res.status(201).json({
      message: "Registration successful! Please wait for TPO approval.",
    });
  } catch (error) {
    console.error("HR Registration Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get HR Profile
exports.getHRProfile = async (req, res) => {
  try {
    const hrProfile = await HRProfile.findOne({ userId: req.user.id });
    if (!hrProfile) {
      return res.status(404).json({ message: "HR Profile not found" });
    }

    const company = await Company.findOne({ name: hrProfile.companyName });
    
    res.status(200).json({
      hrProfile,
      company: company || {}
    });
  } catch (error) {
    console.error("Get HR Profile Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update HR Profile
exports.updateHRProfile = async (req, res) => {
  try {
    const { designation, phone, linkedinUrl, website, industry, logoUrl, gstin, address } = req.body;
    
    const hrProfile = await HRProfile.findOne({ userId: req.user.id });
    if (!hrProfile) {
      return res.status(404).json({ message: "HR Profile not found" });
    }

    // Update HR details
    if (designation) hrProfile.designation = designation;
    if (phone) hrProfile.phone = phone;
    if (linkedinUrl !== undefined) hrProfile.linkedinUrl = linkedinUrl;
    hrProfile.updatedBy = req.user.id;
    await hrProfile.save();

    // Update Company details
    let company = await Company.findOne({ name: hrProfile.companyName });
    if (company) {
      if (website !== undefined) company.website = website;
      if (industry !== undefined) company.industry = industry;
      if (logoUrl !== undefined) company.logoUrl = logoUrl;
      if (gstin !== undefined) company.gstin = gstin;
      if (address !== undefined) company.address = address;
      await company.save();
    }

    res.status(200).json({
      message: "Profile updated successfully",
      hrProfile,
      company
    });
  } catch (error) {
    console.error("Update HR Profile Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get Dashboard Overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const hrId = req.user.id;

    const jobDrives = await JobDrive.find({ postedByHR: hrId });
    const jobDriveIds = jobDrives.map(drive => drive._id);

    const activeDrives = jobDrives.filter(d => d.status === 'ACTIVE').length;

    const totalApplicants = await Application.countDocuments({ jobDriveId: { $in: jobDriveIds } });

    const hiredCandidates = await Application.countDocuments({ jobDriveId: { $in: jobDriveIds }, status: 'HIRED' });

    const applicationStats = await Application.aggregate([
      { $match: { jobDriveId: { $in: jobDriveIds } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const chartData = applicationStats.map(stat => ({
      name: stat._id,
      value: stat.count
    }));

    const recentApplications = await Application.find({ jobDriveId: { $in: jobDriveIds } })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('jobDriveId', 'title')
      .populate('studentId', 'email');
      
    const studentIds = recentApplications
      .filter(app => app.studentId && app.studentId._id)
      .map(app => app.studentId._id);
    const profiles = await StudentProfile.find({ userId: { $in: studentIds } });

    const recentActivity = recentApplications.map(app => {
      const studentIdStr = app.studentId?._id ? app.studentId._id.toString() : null;
      const profile = studentIdStr ? profiles.find(p => p.userId.toString() === studentIdStr) : null;
      return {
        _id: app._id,
        studentName: profile ? `${profile.firstName} ${profile.lastName}`.trim() : (app.studentId?.email || 'A Student'),
        jobTitle: app.jobDriveId?.title || 'Job Drive',
        status: app.status,
        timestamp: app.updatedAt
      };
    });

    res.status(200).json({
      stats: {
        activeDrives,
        totalApplicants,
        hiredCandidates
      },
      chartData,
      recentActivity
    });
  } catch (error) {
    console.error("Get HR Dashboard Overview Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
